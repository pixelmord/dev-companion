import { ContentLayout } from "@/components/layout/ContentLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	return (
		<ContentLayout
			breadcrumbs={{
				items: [
					{ label: "Home", href: "/dashboard" },
					{ label: "Dashboard", href: "/dashboard", isCurrentPage: true },
				],
			}}
		>
			hi
		</ContentLayout>
	);
}
