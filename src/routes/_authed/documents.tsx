import { DocumentsContainer } from "@/features/document-editor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/documents")({
	component: DocumentsRoute,
});

function DocumentsRoute() {
	return <DocumentsContainer />;
}
