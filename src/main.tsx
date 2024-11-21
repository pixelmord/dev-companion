import { ConvexAuthProvider, useAuthToken } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import type { DataModel } from "convex/_generated/dataModel";
import { ThemeProvider } from "./components/ThemeProvider";
import Ripple from "./components/ui/ripple";
import { useCurrentUser } from "./features/user/use-current-user";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

export type AuthContext = {
	isAuthenticated: boolean;
	token: ReturnType<typeof useAuthToken>;
	user?: DataModel["users"]["document"] | null;
};
// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	context: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		auth: undefined!, // This will be set after we wrap the app in an AuthProvider
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});
convexQueryClient.connect(queryClient);

function App() {
	const token = useAuthToken();
	const isAuthenticated = !!token;
	const { data: user, isLoading } = useCurrentUser();
	const auth: AuthContext = { isAuthenticated, token, user };
	if (isLoading) {
		return (
			<div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
				<p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
					Loading
				</p>
				<Ripple />
			</div>
		);
	}
	return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<ConvexAuthProvider client={convex}>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
						<App />
					</ThemeProvider>
				</QueryClientProvider>
			</ConvexAuthProvider>
		</StrictMode>,
	);
}
