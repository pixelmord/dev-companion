import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAppForm } from "@/features/form/form";
import { api } from "@convex-server/_generated/api";
import type { Doc, Id } from "@convex-server/_generated/dataModel";
import * as Sentry from "@sentry/browser";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { MarkdownEditor } from "../index";

// Define the schema in a way compatible with TanStack Form validations
const schema = {
	title: (value: string) => {
		if (!value || value.length < 1) return "Title is required";
		return undefined;
	},
	content: (value: string) => {
		if (!value || value.length < 1) return "Content is required";
		return undefined;
	},
};

interface DocumentFormProps {
	initialDocument?: Doc<"documents"> | null;
	onSaved?: (documentId: Id<"documents">) => void;
	onCancel?: () => void;
}

export function DocumentForm({
	initialDocument,
	onSaved,
	onCancel,
}: DocumentFormProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [markdownContent, setMarkdownContent] = useState<string>("");

	const createDocument = useMutation(api.documents.createDocument);
	const updateDocument = useMutation(api.documents.updateDocument);

	const form = useAppForm({
		defaultValues: {
			title: initialDocument?.title || "",
			description: initialDocument?.description || "",
			content: initialDocument?.content || "",
			isPublic: initialDocument?.isPublic || false,
			tags: initialDocument?.tags || [],
		},
		onSubmit: async ({ value }) => {
			try {
				setIsSaving(true);

				Sentry.startSpan({ name: "Saving document form" }, async () => {
					if (initialDocument) {
						// Update existing document
						const documentId = await updateDocument({
							documentId: initialDocument._id,
							title: value.title,
							content: value.content,
							description: value.description,
							isPublic: value.isPublic,
							tags: value.tags,
							createVersion: true, // Create a new version on each save
						});

						toast("Document updated", {
							description: "Your document has been successfully updated.",
						});

						onSaved?.(documentId);
					} else {
						// Create new document
						const documentId = await createDocument({
							title: value.title,
							content: value.content,
							description: value.description,
							isPublic: value.isPublic,
							tags: value.tags,
						});

						toast("Document created", {
							description: "Your document has been successfully created.",
						});

						onSaved?.(documentId);
					}
				});
			} catch (error) {
				console.error("Error saving document:", error);
				toast("Error", {
					description:
						"There was an error saving your document. Please try again.",
				});
			} finally {
				setIsSaving(false);
			}
		},
	});

	// Handle content updates from the markdown editor
	useEffect(() => {
		form.setFieldValue("content", markdownContent);
	}, [markdownContent, form]);

	// Update markdown content when initialDocument changes
	useEffect(() => {
		if (initialDocument?.content) {
			setMarkdownContent(initialDocument.content);
		}
	}, [initialDocument]);

	return (
		<div className="space-y-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Card>
					<CardContent className="pt-6 space-y-4">
						<form.AppField name="title">
							{(field) => (
								<field.TextField label="Title" placeholder="Document title" />
							)}
						</form.AppField>

						<form.AppField name="description">
							{(field) => (
								<field.TextArea
									label="Description"
									placeholder="A brief description of this document"
								/>
							)}
						</form.AppField>
					</CardContent>
				</Card>

				<div className="mt-6">
					<form.AppField name="content">
						{(field) => (
							<>
								<label htmlFor="content-editor" className="text-sm font-medium">
									Content
								</label>
								<div id="content-editor">
									<MarkdownEditor
										initialValue={initialDocument?.content || ""}
										onChange={setMarkdownContent}
										height="50vh"
									/>
								</div>
								{field.state.meta.errors?.length ? (
									<div className="text-sm text-destructive mt-2">
										{field.state.meta.errors.join(", ")}
									</div>
								) : null}
							</>
						)}
					</form.AppField>
				</div>

				<CardFooter className="flex justify-end gap-2 pt-6">
					{onCancel && (
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					)}
					<form.AppForm>
						<form.SubscribeButton
							label={initialDocument ? "Update Document" : "Create Document"}
						/>
					</form.AppForm>
				</CardFooter>
			</form>
		</div>
	);
}
