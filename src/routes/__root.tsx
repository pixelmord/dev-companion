import type { AuthContext } from "@/main";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { api } from "../../convex/_generated/api";

type AuthRouterContext = {
	auth: AuthContext;
};
export const Route = createRootRouteWithContext<AuthRouterContext>()({
	component: () => {
		return (
			<>
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
			</>
		);
	},
});
