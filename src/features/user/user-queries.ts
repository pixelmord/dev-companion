import { useUser } from "@clerk/clerk-react";

export function useGetUser() {
	const resource = useUser();
	const { user, isLoaded } = resource;
	if (!user && isLoaded) {
		throw new Error("User not found");
	}
	return resource;
}
