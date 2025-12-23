import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Image,
	Italic,
	Link,
	List,
	ListOrdered,
	Quote,
	Redo,
	Undo,
} from "lucide-react";
import type React from "react";

export type MarkdownToolbarProps = {
	className?: string;
	onAction: (action: string, defaultText?: string) => void;
	canUndo?: boolean;
	canRedo?: boolean;
	onUndo?: () => void;
	onRedo?: () => void;
};

type ToolbarAction = {
	name: string;
	icon: React.ComponentType<{ className?: string }>;
	tooltip: string;
	defaultText?: string;
};

export function MarkdownToolbar({
	className,
	onAction,
	canUndo = false,
	canRedo = false,
	onUndo,
	onRedo,
}: MarkdownToolbarProps) {
	const actions: ToolbarAction[] = [
		{
			name: "bold",
			icon: Bold,
			tooltip: "Bold (Ctrl+B)",
			defaultText: "bold text",
		},
		{
			name: "italic",
			icon: Italic,
			tooltip: "Italic (Ctrl+I)",
			defaultText: "italic text",
		},
		{
			name: "heading1",
			icon: Heading1,
			tooltip: "Heading 1",
			defaultText: "Heading 1",
		},
		{
			name: "heading2",
			icon: Heading2,
			tooltip: "Heading 2",
			defaultText: "Heading 2",
		},
		{
			name: "heading3",
			icon: Heading3,
			tooltip: "Heading 3",
			defaultText: "Heading 3",
		},
		{
			name: "bulletList",
			icon: List,
			tooltip: "Bullet List",
			defaultText: "List item",
		},
		{
			name: "numberedList",
			icon: ListOrdered,
			tooltip: "Numbered List",
			defaultText: "List item",
		},
		{ name: "code", icon: Code, tooltip: "Code Block", defaultText: "code" },
		{ name: "link", icon: Link, tooltip: "Link", defaultText: "link text" },
		{
			name: "image",
			icon: Image,
			tooltip: "Image",
			defaultText: "image description",
		},
		{
			name: "quote",
			icon: Quote,
			tooltip: "Blockquote",
			defaultText: "quote text",
		},
	];

	return (
		<div className={cn("flex items-center p-1 bg-muted border-b", className)}>
			<TooltipProvider>
				<div className="flex items-center space-x-1">
					{onUndo && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									disabled={!canUndo}
									onClick={onUndo}
									className="h-8 w-8"
								>
									<Undo className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Undo (Ctrl+Z)</TooltipContent>
						</Tooltip>
					)}

					{onRedo && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									disabled={!canRedo}
									onClick={onRedo}
									className="h-8 w-8"
								>
									<Redo className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Redo (Ctrl+Y)</TooltipContent>
						</Tooltip>
					)}
				</div>

				{(onUndo || onRedo) && (
					<Separator orientation="vertical" className="mx-2 h-6" />
				)}

				<div className="flex flex-wrap items-center gap-1">
					{actions.map((action) => (
						<Tooltip key={action.name}>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onAction(action.name, action.defaultText)}
									className="h-8 w-8"
								>
									<action.icon className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{action.tooltip}</TooltipContent>
						</Tooltip>
					))}
				</div>
			</TooltipProvider>
		</div>
	);
}
