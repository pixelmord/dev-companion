import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
	return useQuery(convexQuery(api.users.viewer, {}));
}
