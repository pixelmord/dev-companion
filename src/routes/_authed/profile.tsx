import { Loader } from "@/components/Loader";
import { ProfileEdit } from "@/features/profile/ProfileEdit";
import { ProfileSetup } from "@/features/profile/ProfileSetup";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/profile")({
	component: ProfilePage,
	loader: async ({ context: { userId, queryClient } }) => {
		const userProfile = await queryClient.ensureQueryData(
			convexQuery(api.users.getProfile, { clerkId: userId || "" }),
		);
		return {
			userId,
			userProfile,
		};
	},
	pendingComponent: () => <Loader />,
});

function ProfilePage() {
	const { userProfile } = Route.useLoaderData();

	// If no profile exists, show the setup form
	if (!userProfile) {
		return <ProfileSetup />;
	}

	// Otherwise, show the edit form
	return <ProfileEdit />;
}
