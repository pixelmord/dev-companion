import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/resources/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authed/resources/"!</div>;
}
