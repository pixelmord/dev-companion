import { Card } from "@/components/ui/card";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Editor, { useMonaco } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { ClientOnly } from "./ClientOnly";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { ScrollablePreview } from "./ScrollablePreview";

export type MarkdownEditorProps = {
	initialValue?: string;
	onChange?: (value: string) => void;
	className?: string;
	height?: string;
};

const DEFAULT_MARKDOWN = `# Hello, Markdown!

This is a sample markdown document. You can edit this content on the left and see the preview on the right.

## Features
- **Bold** and *italic* text
- Lists and numbered lists
- [Links](https://example.com)
- Code blocks
\`\`\`typescript
const hello = (name: string) => {
	console.log(\`Hello, \${name}!\`);
};
\`\`\`

## Try it out!
Start editing to see the changes reflected in real-time.
`;

export function MarkdownEditor({
	initialValue = DEFAULT_MARKDOWN,
	onChange,
	className,
	height = "70vh",
}: MarkdownEditorProps) {
	const [markdownValue, setMarkdownValue] = useState(initialValue);
	const monaco = useMonaco();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	// Prevent controlled/uncontrolled switches
	const isInitialMount = useRef(true);

	// Handle external changes to initialValue only on initial mount
	useEffect(() => {
		if (isInitialMount.current) {
			setMarkdownValue(initialValue);
			isInitialMount.current = false;
		}
	}, [initialValue]);

	// Update undo/redo states
	useEffect(() => {
		if (editorRef.current) {
			// Check if editor has undo/redo capabilities
			const updateUndoRedoState = () => {
				if (editorRef.current) {
					// Check the editor's undo/redo stack directly
					const editor = editorRef.current;
					const model = editor.getModel();
					if (model) {
						const versionId = model.getAlternativeVersionId();
						setCanUndo(editor.hasTextFocus() && versionId > 1);
						setCanRedo(editor.hasTextFocus() && versionId > 1);
					}
				}
			};

			// Initial state
			updateUndoRedoState();

			// Listen for content changes
			const model = editorRef.current.getModel();
			if (model) {
				const disposable = model.onDidChangeContent(() => {
					updateUndoRedoState();
				});

				return () => disposable.dispose();
			}
		}
	}, []);

	// Set focus on the editor when the component mounts
	useEffect(() => {
		// We only want to set focus once when the editor is mounted
		const timeout = setTimeout(() => {
			editorRef.current?.focus();
		}, 300);

		return () => clearTimeout(timeout);
	}, []);

	const handleEditorChange = (value: string | undefined) => {
		if (value !== undefined) {
			setMarkdownValue(value);
			onChange?.(value);
		}
	};

	const handleEditorDidMount = (
		editor: monaco.editor.IStandaloneCodeEditor,
		monacoInstance: Monaco,
	) => {
		editorRef.current = editor;

		// Set initial focus on the editor
		setTimeout(() => {
			editor.focus();
		}, 100);

		// Update undo/redo state after mounting
		const model = editor.getModel();
		if (model) {
			const versionId = model.getAlternativeVersionId();
			setCanUndo(versionId > 1);
			setCanRedo(versionId > 1);
		}
	};

	const handleToolbarAction = (action: string, defaultText = "") => {
		if (!editorRef.current) return;

		const editor = editorRef.current;
		const selection = editor.getSelection();

		if (!selection) return;

		const model = editor.getModel();
		if (!model) return;

		const selectedText = model.getValueInRange(selection);
		let newText = "";

		// Get cursor position
		const startLine = selection.startLineNumber;
		const startColumn = selection.startColumn;
		const endLine = selection.endLineNumber;
		const endColumn = selection.endColumn;

		// Default replacement text if no selection
		const replacementText = selectedText || defaultText;

		switch (action) {
			case "bold":
				newText = `**${replacementText}**`;
				break;
			case "italic":
				newText = `*${replacementText}*`;
				break;
			case "heading1":
				// For headings, ensure we're at the start of a line
				if (startColumn > 1) {
					newText = `\n# ${replacementText}`;
				} else {
					newText = `# ${replacementText}`;
				}
				break;
			case "heading2":
				if (startColumn > 1) {
					newText = `\n## ${replacementText}`;
				} else {
					newText = `## ${replacementText}`;
				}
				break;
			case "heading3":
				if (startColumn > 1) {
					newText = `\n### ${replacementText}`;
				} else {
					newText = `### ${replacementText}`;
				}
				break;
			case "bulletList":
				if (startColumn > 1) {
					newText = `\n- ${replacementText}`;
				} else {
					newText = `- ${replacementText}`;
				}
				break;
			case "numberedList":
				if (startColumn > 1) {
					newText = `\n1. ${replacementText}`;
				} else {
					newText = `1. ${replacementText}`;
				}
				break;
			case "code":
				// Check if it's a multi-line selection
				if (startLine !== endLine) {
					newText = `\`\`\`\n${replacementText}\n\`\`\``;
				} else {
					newText = `\`${replacementText}\``;
				}
				break;
			case "link":
				newText = `[${replacementText}](url)`;
				break;
			case "image":
				newText = `![${replacementText}](image-url)`;
				break;
			case "quote":
				if (startColumn > 1) {
					newText = `\n> ${replacementText}`;
				} else {
					newText = `> ${replacementText}`;
				}
				break;
			default:
				return;
		}

		// Make the edit
		editor.executeEdits("markdown-toolbar", [
			{
				range: selection,
				text: newText,
				forceMoveMarkers: true,
			},
		]);

		// Focus back on the editor
		editor.focus();
	};

	const handleUndo = () => {
		editorRef.current?.trigger("toolbar", "undo", null);
	};

	const handleRedo = () => {
		editorRef.current?.trigger("toolbar", "redo", null);
	};

	return (
		<div
			className={cn(
				"flex flex-col w-full border rounded-lg overflow-hidden",
				className,
			)}
			style={{ height }}
		>
			<MarkdownToolbar
				onAction={handleToolbarAction}
				canUndo={canUndo}
				canRedo={canRedo}
				onUndo={handleUndo}
				onRedo={handleRedo}
			/>

			<div className="flex-1 overflow-hidden">
				<ResizablePanelGroup
					direction="horizontal"
					className="w-full h-full overflow-hidden"
				>
					{/* Editor Panel */}
					<ResizablePanel
						defaultSize={50}
						minSize={30}
						className="overflow-hidden"
					>
						<div className="h-full w-full overflow-hidden">
							<ClientOnly fallback={<Skeleton className="h-full w-full" />}>
								<Editor
									height="100%"
									defaultLanguage="markdown"
									language="markdown"
									defaultValue={markdownValue}
									onChange={handleEditorChange}
									onMount={handleEditorDidMount}
									options={{
										minimap: { enabled: false },
										wordWrap: "on",
										scrollBeyondLastLine: false,
										lineNumbers: "on",
										fontSize: 14,
										tabSize: 2,
										automaticLayout: true,
									}}
									theme="vs-dark"
								/>
							</ClientOnly>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Preview Panel */}
					<ResizablePanel
						defaultSize={50}
						minSize={30}
						className="overflow-hidden"
					>
						<ScrollablePreview content={markdownValue} />
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
