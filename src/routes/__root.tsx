import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanstackQueryLayout from "../integrations/tanstack-query/layout";

import appCss from "../styles.css?url";

import { NotFound } from "@/components/NotFound";
import { DefaultCatchBoundary } from "@/features/app/DefaultCatchBoundary";

import { Toaster } from "@/components/ui/sonner";
import { getAuth } from "@clerk/tanstack-react-start/server";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "next-themes";
import { getWebRequest } from "vinxi/http";

interface MyRouterContext {
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
}

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
	const auth = await getAuth(getWebRequest());
	const token = await auth.getToken({ template: "convex" });

	return {
		userId: auth.userId,
		token,
	};
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
			{},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	beforeLoad: async (ctx) => {
		const { userId, token } = await fetchClerkAuth();
		// During SSR only (the only time serverHttpClient exists),
		// set the Clerk auth token to make HTTP queries with.
		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		return {
			clerkId: userId,
			token,
		};
	},
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});
function RootComponent() {
	const context = useRouteContext({ from: Route.id });
	return (
		<RootDocument>
			<ClerkProvider>
				<ConvexProviderWithClerk
					client={context.convexClient}
					useAuth={useAuth}
				>
					<Outlet />
					<Toaster />
					<TanStackRouterDevtools />
					<TanstackQueryLayout />
				</ConvexProviderWithClerk>
			</ClerkProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider attribute="class" enableColorScheme enableSystem>
					{children}
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
