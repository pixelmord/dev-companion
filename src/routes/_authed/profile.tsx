import { Loader } from "@/components/Loader";
import { ProfileEdit } from "@/features/profile/ProfileEdit";
import { ProfileSetup } from "@/features/profile/ProfileSetup";
import { useCreateProfile } from "@/features/profile/profile-queries";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authed/profile")({
	component: ProfilePage,
	loader: async ({ context: { clerkId, queryClient, userId, auth } }) => {
		const clerkUser = await auth.getUser();
		const userProfile = await queryClient.ensureQueryData(
			convexQuery(api.users.getProfile, { clerkId }),
		);
		return {
			clerkId,
			clerkUser,
			userId,
			userProfile,
		};
	},
	pendingComponent: () => <Loader />,
});

function ProfilePage() {
	const { userProfile, clerkId, clerkUser } = Route.useLoaderData();
	const { mutate } = useCreateProfile();
	const [isPending, setIsPending] = useState(true);

	// If no profile exists, show the setup form
	if (!userProfile && isPending) {
		mutate(
			{
				clerkId,
				name: clerkUser.name,
				email: clerkUser.email,
				avatarUrl: clerkUser.image,
				role: "user",
				bio: "",
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
