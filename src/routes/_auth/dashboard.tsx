import { ContentLayout } from "@/components/layout/content-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
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
