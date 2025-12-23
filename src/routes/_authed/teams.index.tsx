import { ContentLayout } from "@/components/layout/ContentLayout";
import { TeamManagement } from "@/features/profile/TeamManagement";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/teams/")({
	component: TeamsPage,
});

function TeamsPage() {
	const { userId } = Route.useRouteContext();
	return (
		<ContentLayout
			breadcrumbs={{
				items: [
					{ label: "Home", href: "/dashboard" },
					{ label: "Teams", href: "/teams", isCurrentPage: true },
				],
			}}
		>
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Teams</h1>
					<p className="text-muted-foreground">
						Create and manage your teams. Teams help you collaborate with others
						on projects and resources.
					</p>
				</div>

				<TeamManagement userId={userId} />
			</div>
		</ContentLayout>
	);
}
