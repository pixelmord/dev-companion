import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@convex-server/_generated/api";
import type { Doc, Id } from "@convex-server/_generated/dataModel";
import * as Sentry from "@sentry/browser";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, History, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MarkdownEditor } from "../";

interface DocumentDetailProps {
	documentId: Id<"documents">;
	onBack?: () => void;
}

export function DocumentDetail({ documentId, onBack }: DocumentDetailProps) {
	const [content, setContent] = useState<string>("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isLoadingVersion, setIsLoadingVersion] = useState(false);

	// Fetch the document
	const document = useQuery(api.documents.getDocument, {
		documentId,
	});

	// Fetch document versions
	const versions = useQuery(api.documents.getDocumentVersions, {
		documentId,
	});

	// Update document mutation
	const updateDocument = useMutation(api.documents.updateDocument);
	const deleteDocument = useMutation(api.documents.deleteDocument);
	const restoreVersion = useMutation(api.documents.restoreDocumentVersion);

	// Set the initial content when document is loaded
	if (document && content === "") {
		setContent(document.content);
	}

	const handleSave = async () => {
		if (!document) return;

		try {
			Sentry.startSpan({ name: "Saving document changes" }, async () => {
				await updateDocument({
					documentId,
					content,
					createVersion: true,
				});

				toast("Document updated", {
					description: "Your changes have been saved successfully.",
				});
			});
		} catch (error) {
			console.error("Error saving document:", error);
			toast("Error saving document", {
				description:
					"There was an error saving your changes. Please try again.",
			});
		}
	};

	const handleDelete = async () => {
		try {
			await deleteDocument({ documentId });

			toast("Document deleted", {
				description: "The document has been deleted successfully.",
			});

			onBack?.();
		} catch (error) {
			console.error("Error deleting document:", error);
			toast("Error deleting document", {
				description:
					"There was an error deleting the document. Please try again.",
			});
		}
	};

	const handleRestoreVersion = async (versionNumber: number) => {
		try {
			setIsLoadingVersion(true);

			await restoreVersion({
				documentId,
				versionNumber,
			});

			toast("Version restored", {
				description: `Version ${versionNumber} has been restored successfully.`,
			});

			// After restoring, just reload the page to refetch all data
			// This is simpler and more reliable than trying to manually refetch
			window.location.reload();
		} catch (error) {
			console.error("Error restoring version:", error);
			toast("Error restoring version", {
				description:
					"There was an error restoring the version. Please try again.",
			});
		} finally {
			setIsLoadingVersion(false);
		}
	};

	if (!document) {
		return <DocumentDetailSkeleton />;
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={onBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h2 className="text-2xl font-bold">{document.title}</h2>
						{document.description && (
							<p className="text-muted-foreground">{document.description}</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<History className="h-4 w-4 mr-2" />
								<span>History</span>
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Version History</SheetTitle>
							</SheetHeader>
							<div className="mt-4 space-y-4">
								{versions?.map((version) => (
									<div
										key={version._id}
										className="border rounded-md p-3 hover:bg-accent/50 transition-colors"
									>
										<div className="flex justify-between items-center">
											<div>
												<p className="font-medium">
													Version {version.versionNumber}
												</p>
												<p className="text-sm text-muted-foreground">
													{formatDistanceToNow(new Date(version.createdAt), {
														addSuffix: true,
													})}
												</p>
											</div>
											<Button
												variant="ghost"
												size="sm"
												disabled={isLoadingVersion}
												onClick={() =>
													handleRestoreVersion(version.versionNumber)
												}
											>
												Restore
											</Button>
										</div>
									</div>
								))}

								{!versions?.length && (
									<p className="text-center text-muted-foreground py-4">
										No version history available
									</p>
								)}
							</div>
						</SheetContent>
					</Sheet>

					<Button variant="outline" size="sm" onClick={handleSave}>
						<Save className="h-4 w-4 mr-2" />
						<span>Save</span>
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="text-destructive"
						onClick={() => setShowDeleteDialog(true)}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						<span>Delete</span>
					</Button>
				</div>
			</div>

			<div className="flex-grow">
				<MarkdownEditor
					initialValue={document.content}
					onChange={setContent}
					height="calc(100vh - 160px)"
				/>
			</div>

			{/* Delete confirmation dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Document</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{document.title}"? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function DocumentDetailSkeleton() {
	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div>
						<Skeleton className="h-7 w-64 mb-2" />
						<Skeleton className="h-4 w-80" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-20" />
					<Skeleton className="h-9 w-24" />
				</div>
			</div>
			<Skeleton className="flex-grow" />
		</div>
	);
}
