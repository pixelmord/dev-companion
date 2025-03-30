import { ContentLayout } from "@/components/layout/ContentLayout";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/boards")({
	component: RouteComponent,
});

function RouteComponent() {
	const boardsQuery = useSuspenseQuery(convexQuery(api.board.getBoards, {}));

	return (
		<ContentLayout
			breadcrumbs={{
				items: [
					{ label: "Home", href: "/dashboard" },
					{ label: "Boards", href: "/boards", isCurrentPage: true },
				],
			}}
		>
			<h1 className="text-2xl font-black">Boards</h1>
			<ul className="flex flex-wrap list-disc">
				{boardsQuery.data.map((board) => (
					<li key={board.id} className="ml-4">
						<Link
							to="/boards/$boardId"
							params={{
								boardId: board.id,
							}}
							className="font-bold text-blue-500"
						>
							{board.name}
						</Link>
					</li>
				))}
			</ul>
			<Outlet />
		</ContentLayout>
	);
}
