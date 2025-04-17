import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@convex-server/_generated/api";
import type { Doc, Id } from "@convex-server/_generated/dataModel";
import * as Sentry from "@sentry/browser";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, FileText, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentListProps {
	teamId?: Id<"teams">;
	onSelectDocument?: (documentId: Id<"documents">) => void;
	onCreateNew?: () => void;
}

export function DocumentList({
	teamId,
	onSelectDocument,
	onCreateNew,
}: DocumentListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

	// Get all documents for the current user and team
	const documents = useQuery(api.documents.listDocuments, {
		teamId,
		includePublic: true,
	});

	const filteredAndSortedDocuments = Sentry.startSpan(
		{ name: "Filter and sort documents" },
		() => {
			if (!documents) return [];

			// Filter documents
			let filtered = documents;
			if (searchQuery) {
				const lowerQuery = searchQuery.toLowerCase();
				filtered = documents.filter(
					(doc: Doc<"documents">) =>
						doc.title.toLowerCase().includes(lowerQuery) ||
						doc.description?.toLowerCase().includes(lowerQuery),
				);
			}

			// Sort documents
			return [...filtered].sort((a, b) => {
				switch (sortBy) {
					case "newest":
						return b.lastEditedAt - a.lastEditedAt;
					case "oldest":
						return a.lastEditedAt - b.lastEditedAt;
					case "title":
						return a.title.localeCompare(b.title);
					default:
						return 0;
				}
			});
		},
	);

	if (documents === undefined) {
		return <DocumentListSkeleton />;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search documents..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<Select
					value={sortBy}
					onValueChange={(value: string) =>
						setSortBy(value as "newest" | "oldest" | "title")
					}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest first</SelectItem>
						<SelectItem value="oldest">Oldest first</SelectItem>
						<SelectItem value="title">Title (A-Z)</SelectItem>
					</SelectContent>
				</Select>

				{onCreateNew && <Button onClick={onCreateNew}>New Document</Button>}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredAndSortedDocuments.length === 0 ? (
					<Card className="col-span-full p-6">
						<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
							<FileText className="h-12 w-12 text-muted-foreground/60" />
							<h3 className="text-xl font-semibold">No documents found</h3>
							<p className="text-muted-foreground">
								{searchQuery
									? "No documents match your search. Try a different query."
									: "Create your first document to get started."}
							</p>
							{onCreateNew && (
								<Button onClick={onCreateNew} className="mt-2">
									Create Document
								</Button>
							)}
						</div>
					</Card>
				) : (
					filteredAndSortedDocuments.map((doc) => (
						<DocumentCard
							key={doc._id}
							document={doc}
							onClick={() => onSelectDocument?.(doc._id)}
						/>
					))
				)}
			</div>
		</div>
	);
}

interface DocumentCardProps {
	document: Doc<"documents">;
	onClick?: () => void;
}

function DocumentCard({ document, onClick }: DocumentCardProps) {
	return (
		<Card
			className="transition-all hover:shadow-md cursor-pointer"
			onClick={onClick}
		>
			<CardHeader className="pb-2">
				<CardTitle className="line-clamp-1">{document.title}</CardTitle>
				<CardDescription className="line-clamp-2">
					{document.description || "No description"}
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-2">
				<div className="line-clamp-3 text-sm text-muted-foreground">
					{document.content.slice(0, 150)}
					{document.content.length > 150 ? "..." : ""}
				</div>
			</CardContent>
			<CardFooter className="flex justify-between pt-2">
				<span className="text-xs text-muted-foreground">
					Last edited{" "}
					{formatDistanceToNow(new Date(document.lastEditedAt), {
						addSuffix: true,
					})}
				</span>
				<ChevronRight className="h-4 w-4 text-muted-foreground/60" />
			</CardFooter>
		</Card>
	);
}

function DocumentListSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-[150px]" />
				<Skeleton className="h-10 w-[120px]" />
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[
					"skeleton-card-1",
					"skeleton-card-2",
					"skeleton-card-3",
					"skeleton-card-4",
					"skeleton-card-5",
					"skeleton-card-6",
				].map((id) => (
					<Card key={id} className="overflow-hidden">
						<CardHeader className="pb-2">
							<Skeleton className="h-5 w-4/5" />
							<Skeleton className="h-4 w-3/4" />
						</CardHeader>
						<CardContent className="pb-2">
							<Skeleton className="h-4 w-full mb-1" />
							<Skeleton className="h-4 w-full mb-1" />
							<Skeleton className="h-4 w-2/3" />
						</CardContent>
						<CardFooter className="pt-2">
							<Skeleton className="h-4 w-1/3" />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
