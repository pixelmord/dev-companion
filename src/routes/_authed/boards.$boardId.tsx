import { Loader } from "@/components/Loader";
import { Board } from "@/features/trello-board/Board";
import { boardQueries } from "@/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/boards/$boardId")({
	component: Home,
	pendingComponent: () => <Loader />,
	loader: async ({ params, context: { queryClient } }) => {
		await queryClient.ensureQueryData(boardQueries.detail(params.boardId));
	},
});

function Home() {
	const { boardId } = Route.useParams();

	return <Board boardId={boardId} />;
}
