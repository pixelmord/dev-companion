import { Loader } from "@/components/Loader";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/app/AppSidebar";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ context: { clerkId, queryClient }, location }) => {
		if (!clerkId) {
			throw redirect({
				to: "/sign-in/$",
				search: {
					redirect: location.href,
				},
			});
		}
		const userProfile = await queryClient.ensureQueryData(
			convexQuery(api.users.getProfile, { clerkId: clerkId }),
		);
		if (!userProfile) {
			throw redirect({ to: "/profile" });
		}
		return {
			clerkId,
			userProfile,
			userId: userProfile._id,
		};
	},
	pendingComponent: () => <Loader />,
	component: RouteComponent,
});

function RouteComponent() {
	const { userProfile } = Route.useRouteContext();

	return (
		<SidebarProvider>
			<AppSidebar userProfile={userProfile} />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
