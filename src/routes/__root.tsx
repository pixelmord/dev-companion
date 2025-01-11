import type { AuthContext } from "@/main";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

type AuthRouterContext = {
	auth: AuthContext;
	queryClient: QueryClient;
};
export const Route = createRootRouteWithContext<AuthRouterContext>()({
	component: () => {
		return (
			<>
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools
					initialIsOpen={false}
					buttonPosition="bottom-right"
				/>
			</>
		);
	},
});
