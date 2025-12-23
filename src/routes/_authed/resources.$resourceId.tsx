import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/resources/$resourceId")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authed/resources/$resourceId"!</div>;
}
