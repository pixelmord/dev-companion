import { Loader } from "@/components/Loader";
import { ProfileEdit } from "@/features/profile/ProfileEdit";
import { ProfileSetup } from "@/features/profile/ProfileSetup";
import { useCreateProfile } from "@/features/profile/profile-queries";
import { useUser } from "@clerk/clerk-react";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authed/profile")({
	component: ProfilePage,
	loader: async ({ context: { clerkId, queryClient, userId } }) => {
		const userProfile = await queryClient.ensureQueryData(
			convexQuery(api.users.getProfile, { clerkId }),
		);
		return {
			clerkId,
			userId,
			userProfile,
		};
	},
	pendingComponent: () => <Loader />,
});

function ProfilePage() {
	const { userProfile, clerkId } = Route.useLoaderData();
	const { mutate } = useCreateProfile();
	const { user: clerkUser, isLoaded } = useUser();
	const [isPending, setIsPending] = useState(true);
	if (!isLoaded && !userProfile) return <Loader />;

	// If no profile exists, show the setup form
	if (!userProfile && isPending && clerkUser) {
		mutate(
			{
				clerkId,
				name: clerkUser.fullName || "",
				email: clerkUser.emailAddresses[0].emailAddress,
				avatarUrl: clerkUser.imageUrl,
				role: "user",
				bio: "",
				connections: [],
				preferences: {
					theme: "system",
					notifications: true,
					emailDigest: true,
				},
			},
			{ onSuccess: () => setIsPending(false) },
		);
	}
	if (!userProfile && !isPending) {
		return <ProfileSetup />;
	}

	// Otherwise, show the edit form
	return <ProfileEdit />;
}
