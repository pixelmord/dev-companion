import { ConvexQueryClient } from "@convex-dev/react-query";
// import * as SentryServer from "@sentry/node";
// import * as Sentry from "@sentry/react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
// import { createIsomorphicFn } from "@tanstack/react-start";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NotFound } from "./components/NotFound";
import { DefaultCatchBoundary } from "./features/app/DefaultCatchBoundary";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
	const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
	if (!CONVEX_URL) {
		throw new Error("missing VITE_CONVEX_URL envar");
	}
	const convex = new ConvexReactClient(CONVEX_URL, {
		unsavedChangesWarning: false,
	});
	const convexQueryClient = new ConvexQueryClient(convex);

	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});
	convexQueryClient.connect(queryClient);

	const router = routerWithQueryClient(
		createTanStackRouter({
			routeTree,
			defaultPreload: "intent",
			// react-query will handle data fetching & caching
			// https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
			defaultPreloadStaleTime: 0,
			defaultErrorComponent: DefaultCatchBoundary,
			defaultNotFoundComponent: () => <NotFound />,
			context: { queryClient, convexClient: convex, convexQueryClient },
			Wrap: ({ children }) => (
				<ConvexProvider client={convexQueryClient.convexClient}>
					{children}
				</ConvexProvider>
			),
		}),
		queryClient,
	);

	return router;
}

// const router = createRouter();

// createIsomorphicFn()
// 	.server(() => {
// 		SentryServer.init({
// 			dsn: import.meta.env.VITE_SENTRY_DSN,
// 			tracesSampleRate: 1.0,
// 			profilesSampleRate: 1.0,
// 		});
// 	})
// 	.client(() => {
// 		Sentry.init({
// 			dsn: import.meta.env.VITE_SENTRY_DSN,
// 			integrations: [
// 				Sentry.replayIntegration({
// 					maskAllText: false,
// 					blockAllMedia: false,
// 				}),
// 				Sentry.tanstackRouterBrowserTracingIntegration(router),
// 			],
// 			tracesSampleRate: 1.0,
// 			replaysSessionSampleRate: 1.0,
// 			replaysOnErrorSampleRate: 1.0,
// 		});
// 	})();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
