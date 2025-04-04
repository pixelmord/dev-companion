import { Loader } from "@/components/Loader";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/app/AppSidebar";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context, location }) => {
		if (!context.userId) {
			throw redirect({
				to: "/sign-in/$",
				search: {
					redirect: location.href,
				},
			});
		}
		return {
			userId: context.userId,
		};
	},
	loader: async ({ context: { userId, queryClient } }) => {
		const userProfile = await queryClient.ensureQueryData(
			convexQuery(api.users.getProfile, { clerkId: userId || "" }),
		);
		return {
			userId,
			userProfile,
		};
	},
	pendingComponent: () => <Loader />,
	component: RouteComponent,
});

function RouteComponent() {
	const { userProfile } = Route.useLoaderData();

	if (!userProfile) {
		throw redirect({ to: "/profile" });
	}

	return (
		<SidebarProvider>
			<AppSidebar userProfile={userProfile} />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
