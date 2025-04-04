import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export function useUpdateProfile() {
	const mutationFn = useConvexMutation(
		api.users.updateProfile,
	).withOptimisticUpdate((localStore, args) => {
		const profile = localStore.getQuery(api.users.getProfile, {
			clerkId: args.id,
		});
		if (!profile) return;

		const updatedProfile = {
			...profile,
			...args,
		};

		localStore.setQuery(
			api.users.getProfile,
			{ clerkId: profile.clerkId },
			updatedProfile,
		);
	});

	return useMutation({ mutationFn });
}
export function useCreateProfile() {
	const mutationFn = useConvexMutation(api.users.createProfile);

	return useMutation({ mutationFn });
}

export function useGetProfile(clerkId: string) {
	return useSuspenseQuery(convexQuery(api.users.getProfile, { clerkId }));
}
