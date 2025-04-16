import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/features/document-editor";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

export const Route = createFileRoute("/_authed/documents")({
	component: DocumentsRoute,
});

function DocumentsRoute() {
	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Documents</h1>
				<Button className="gap-1">
					<PlusIcon className="h-4 w-4" />
					New Document
				</Button>
			</div>

			<div className="mb-6">
				<p className="text-muted-foreground mb-4">
					Create and edit markdown documents with real-time preview.
				</p>
			</div>

			<div className="bg-card rounded-lg border shadow-sm">
				<MarkdownEditor height="70vh" />
			</div>
		</div>
	);
}
