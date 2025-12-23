import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@convex-server/_generated/api";
import type { Doc, Id } from "@convex-server/_generated/dataModel";
import * as Sentry from "@sentry/browser";
import { useQuery } from "convex/react";
import { useState } from "react";
import { DocumentDetail } from "./DocumentDetail";
import { DocumentForm } from "./DocumentForm";
import { DocumentList } from "./DocumentList";

export enum DocumentsView {
	LIST = "list",
	DETAIL = "detail",
	CREATE = "create",
	EDIT = "edit",
}

interface DocumentsContainerProps {
	teamId?: Id<"teams">;
}

export function DocumentsContainer({ teamId }: DocumentsContainerProps) {
	const [currentView, setCurrentView] = useState<DocumentsView>(
		DocumentsView.LIST,
	);
	const [selectedDocumentId, setSelectedDocumentId] =
		useState<Id<"documents"> | null>(null);

	// Fetch the selected document when in DETAIL or EDIT view
	const selectedDocument = useQuery(
		api.documents.getDocument,
		selectedDocumentId ? { documentId: selectedDocumentId } : "skip",
	);

	const handleSelectDocument = (documentId: Id<"documents">) => {
		Sentry.startSpan({ name: "Select document" }, () => {
			setSelectedDocumentId(documentId);
			setCurrentView(DocumentsView.DETAIL);
		});
	};

	const handleCreateNew = () => {
		setSelectedDocumentId(null);
		setCurrentView(DocumentsView.CREATE);
	};

	const handleBack = () => {
		setCurrentView(DocumentsView.LIST);
	};

	const handleSaved = (documentId: Id<"documents">) => {
		setSelectedDocumentId(documentId);
		setCurrentView(DocumentsView.DETAIL);
	};

	// Render the current view
	const renderContent = () => {
		switch (currentView) {
			case DocumentsView.DETAIL:
				if (!selectedDocumentId) {
					return (
						<div className="flex items-center justify-center h-full">
							<p className="text-muted-foreground">No document selected</p>
						</div>
					);
				}

				return (
					<DocumentDetail documentId={selectedDocumentId} onBack={handleBack} />
				);

			case DocumentsView.CREATE:
				return (
					<div className="container mx-auto py-6">
						<h1 className="text-3xl font-bold mb-6">Create Document</h1>
						<DocumentForm onSaved={handleSaved} onCancel={handleBack} />
					</div>
				);

			case DocumentsView.EDIT:
				return (
					<div className="container mx-auto py-6">
						<h1 className="text-3xl font-bold mb-6">Edit Document</h1>
						<DocumentForm
							initialDocument={selectedDocument}
							onSaved={handleSaved}
							onCancel={handleBack}
						/>
					</div>
				);

			default:
				return (
					<div className="container mx-auto py-6">
						<div className="flex justify-between items-center mb-6">
							<h1 className="text-3xl font-bold">Documents</h1>
						</div>

						<Tabs defaultValue="all" className="mb-6">
							<TabsList>
								<TabsTrigger value="all">All Documents</TabsTrigger>
								<TabsTrigger value="my">My Documents</TabsTrigger>
								{teamId && (
									<TabsTrigger value="team">Team Documents</TabsTrigger>
								)}
							</TabsList>

							<TabsContent value="all" className="mt-4">
								<DocumentList
									teamId={teamId}
									onSelectDocument={handleSelectDocument}
									onCreateNew={handleCreateNew}
								/>
							</TabsContent>

							<TabsContent value="my" className="mt-4">
								<DocumentList
									onSelectDocument={handleSelectDocument}
									onCreateNew={handleCreateNew}
								/>
							</TabsContent>

							{teamId && (
								<TabsContent value="team" className="mt-4">
									<DocumentList
										teamId={teamId}
										onSelectDocument={handleSelectDocument}
										onCreateNew={handleCreateNew}
									/>
								</TabsContent>
							)}
						</Tabs>
					</div>
				);
		}
	};

	return renderContent();
}
