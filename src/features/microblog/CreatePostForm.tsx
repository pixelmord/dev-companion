import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Code, Paperclip, PlusCircle, Send, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import CodeSnippet from "./CodeSnippet";

type FormValues = {
	content: string;
	tags: string[];
	codeSnippet?: { code: string; language: string };
	resourceId?: string;
	projectId?: string;
};

const CreatePostForm = () => {
	const { currentUser, addMicroPost, resources, projects } = useApp();
	const { toast } = useToast();
	const [showCodeEditor, setShowCodeEditor] = useState(false);
	const [showAttachments, setShowAttachments] = useState(false);
	const [codeValue, setCodeValue] = useState("");
	const [codeLanguage, setCodeLanguage] = useState("javascript");
	const [currentTag, setCurrentTag] = useState("");

	const form = useForm<FormValues>({
		defaultValues: {
			content: "",
			tags: [],
		},
	});

	const handleAddTag = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			if (
				currentTag.trim() &&
				!form.getValues().tags.includes(currentTag.trim())
			) {
				form.setValue("tags", [...form.getValues().tags, currentTag.trim()]);
				setCurrentTag("");
			}
		}
	};

	const handleRemoveTag = (tag: string) => {
		form.setValue(
			"tags",
			form.getValues().tags.filter((t) => t !== tag),
		);
	};

	const handleSubmit = (values: FormValues) => {
		if (!currentUser) return;

		const newPost = {
			id: uuidv4(),
			userId: currentUser.id,
			content: values.content,
			tags: values.tags,
			postedAt: new Date().toISOString(),
			likes: [],
			comments: [],
			...(values.resourceId && { attachedResourceId: values.resourceId }),
			...(values.projectId && { attachedProjectId: values.projectId }),
			...(showCodeEditor &&
				codeValue.trim() && {
					codeSnippet: {
						code: codeValue,
						language: codeLanguage,
					},
				}),
		};

		addMicroPost(newPost);

		toast({
			title: "Post created!",
			description: "Your CodeByte has been shared with the community",
			variant: "default",
		});

		// Reset form
		form.reset();
		setShowCodeEditor(false);
		setShowAttachments(false);
		setCodeValue("");
		setCodeLanguage("javascript");
	};

	return (
		<div className="retro-container p-4">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										placeholder="Share your coding thoughts, updates, or ask a question..."
										className="bg-retro-dark text-adaptive resize-none min-h-[100px]"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Tags input */}
					<div>
						<div className="flex flex-wrap gap-2 mb-2">
							{form.getValues().tags.map((tag) => (
								<div
									key={tag}
									className="bg-retro-light text-neon-cyan text-xs px-2 py-1 rounded-sm flex items-center"
								>
									#{tag}
									<button
										type="button"
										onClick={() => handleRemoveTag(tag)}
										className="ml-1 text-white/50 hover:text-white"
									>
										<X size={12} />
									</button>
								</div>
							))}
						</div>

						<input
							type="text"
							value={currentTag}
							onChange={(e) => setCurrentTag(e.target.value)}
							onKeyDown={handleAddTag}
							placeholder="Add tags (press Enter to add)"
							className="w-full px-3 py-2 text-sm rounded-sm bg-retro-dark text-adaptive border border-retro-light focus:outline-hidden focus:border-neon-cyan/50"
						/>
					</div>

					{/* Code snippet editor */}
					{showCodeEditor && (
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<h3 className="text-neon-cyan text-sm font-pixel">
									Code Snippet
								</h3>
								<div className="flex items-center space-x-2">
									<select
										value={codeLanguage}
										onChange={(e) => setCodeLanguage(e.target.value)}
										className="bg-retro-dark border border-retro-light text-adaptive text-xs p-1 rounded-sm"
									>
										<option value="javascript">JavaScript</option>
										<option value="typescript">TypeScript</option>
										<option value="jsx">JSX</option>
										<option value="tsx">TSX</option>
										<option value="css">CSS</option>
										<option value="html">HTML</option>
										<option value="json">JSON</option>
										<option value="python">Python</option>
										<option value="rust">Rust</option>
										<option value="go">Go</option>
									</select>

									<button
										type="button"
										onClick={() => setShowCodeEditor(false)}
										className="text-white/50 hover:text-white"
									>
										<X size={16} />
									</button>
								</div>
							</div>

							<Textarea
								value={codeValue}
								onChange={(e) => setCodeValue(e.target.value)}
								placeholder="// Paste your code here"
								className="font-mono text-neon-green bg-retro-dark resize-none min-h-[150px] border border-retro-light"
							/>

							{codeValue && (
								<div className="mt-2">
									<h4 className="text-xs text-white/50 mb-1">Preview:</h4>
									<CodeSnippet code={codeValue} language={codeLanguage} />
								</div>
							)}
						</div>
					)}

					{/* Attachment selector */}
					{showAttachments && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h3 className="text-neon-cyan text-sm font-pixel mb-2">
									Attach Resource
								</h3>
								<select
									onChange={(e) => form.setValue("resourceId", e.target.value)}
									className="w-full bg-retro-dark border border-retro-light text-adaptive p-2 rounded-sm"
									defaultValue=""
								>
									<option value="">Select a resource</option>
									{resources.map((resource) => (
										<option key={resource.id} value={resource.id}>
											{resource.title}
										</option>
									))}
								</select>
							</div>

							<div>
								<h3 className="text-neon-cyan text-sm font-pixel mb-2">
									Attach Project
								</h3>
								<select
									onChange={(e) => form.setValue("projectId", e.target.value)}
									className="w-full bg-retro-dark border border-retro-light text-adaptive p-2 rounded-sm"
									defaultValue=""
								>
									<option value="">Select a project</option>
									{projects.map((project) => (
										<option key={project.id} value={project.id}>
											{project.name}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					<div className="flex items-center justify-between pt-2 border-t border-retro-light">
						<div className="flex space-x-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-neon-green"
								onClick={() => setShowCodeEditor(!showCodeEditor)}
							>
								<Code size={16} />
							</Button>

							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-neon-yellow"
								onClick={() => setShowAttachments(!showAttachments)}
							>
								<Paperclip size={16} />
							</Button>
						</div>

						<Button
							type="submit"
							className="bg-neon-cyan text-retro-dark hover:bg-neon-cyan/90"
						>
							<Send size={16} className="mr-2" />
							Share
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default CreatePostForm;
