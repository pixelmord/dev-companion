import { ProfileEdit } from "@/components/profile/ProfileEdit";
import { ProfileSetup } from "@/components/profile/ProfileSetup";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex-server/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/_authed/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { user } = useUser();
	const profile = useQuery(api.users.getProfile, { clerkId: user?.id || "" });

	// Show loading state while we check if user has a profile
	if (profile === undefined) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// If no profile exists, show the setup form
	if (!profile) {
		return <ProfileSetup />;
	}

	// Otherwise, show the edit form
	return <ProfileEdit />;
}
