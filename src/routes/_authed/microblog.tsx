import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/microblog")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authed/microblog"!</div>;
}
