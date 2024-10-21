import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
	component: () => (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
			</SidebarInset>
		</SidebarProvider>
	),
});
