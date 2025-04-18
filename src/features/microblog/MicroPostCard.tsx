import type React from "react";
import { useState } from "react";

import { Link as RouterLink } from "@tanstack/react-router";
import {
	Calendar,
	Code,
	Heart,
	Link,
	MessageCircle,
	Share,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	type MicroPost,
	mockConnections,
	mockProjects,
	mockResources,
} from "@/data/mock-data";
import CodeSnippet from "./CodeSnippet";
import { CommentSection } from "./CommentSection";

interface MicroPostCardProps {
	post: MicroPost;
}

const MicroPostCard: React.FC<MicroPostCardProps> = ({ post }) => {
	const [showComments, setShowComments] = useState(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} @ ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	};

	const poster =
		mockConnections.find((user) => user.id === post.userId) ||
		(currentUser?.id === post.userId ? currentUser : null);

	const attachedResource = post.attachedResourceId
		? mockResources.find((res) => res.id === post.attachedResourceId)
		: null;

	const attachedProject = post.attachedProjectId
		? mockProjects.find((proj) => proj.id === post.attachedProjectId)
		: null;

	const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

	const handleLike = () => {
		if (!currentUser) return;
		likeMicroPost(post.id, currentUser.id);
	};

	const handleShare = () => {
		navigator.clipboard.writeText(
			`${window.location.origin}/microblog/post/${post.id}`,
		);
		toast.success("Link copied!", {
			description: "Post link copied to clipboard",
		});
	};

	return (
		<Card className="retro-card overflow-hidden animate-pixel-fade-in">
			<div className="flex items-start space-x-3">
				{poster && (
					<img
						src={poster.avatar}
						alt={poster.name}
						className="w-10 h-10 rounded-md"
					/>
				)}
				<div className="grow">
					<div className="flex justify-between items-start">
						<div>
							<div className="font-pixel text-neon-cyan">
								{poster?.name || "Unknown User"}
							</div>
							<div className="flex items-center text-xs text-white/50">
								<Calendar size={10} className="mr-1" />
								{formatDate(post.postedAt)}
							</div>
						</div>
					</div>

					<div className="mt-2 text-adaptive whitespace-pre-wrap">
						{post.content}
					</div>

					{/* Code snippet display */}
					{post.codeSnippet && (
						<div className="mt-3">
							<CodeSnippet
								code={post.codeSnippet.code}
								language={post.codeSnippet.language}
							/>
						</div>
					)}

					{/* Attached resources and projects */}
					{(attachedResource || attachedProject) && (
						<div className="mt-3 p-2 border border-retro-light rounded-sm bg-retro-dark/50">
							<div className="flex items-center text-xs">
								<Link size={12} className="mr-1 text-neon-yellow" />
								<span className="text-neon-yellow">Linked:</span>
							</div>

							{attachedResource && (
								<RouterLink
									to={`/resources/${attachedResource.id}`}
									className="mt-1 text-sm text-neon-cyan hover:underline flex items-center"
								>
									<span className="mr-1">📄</span> {attachedResource.title}
								</RouterLink>
							)}

							{attachedProject && (
								<RouterLink
									to={`/projects/${attachedProject.id}`}
									className="mt-1 text-sm text-neon-green hover:underline flex items-center"
								>
									<span className="mr-1">📁</span> {attachedProject.name}
								</RouterLink>
							)}
						</div>
					)}

					{/* Tags */}
					{post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-3">
							{post.tags.map((tag, index) => (
								<span
									key={index}
									className="text-xs bg-retro-light px-2 py-0.5 rounded-sm text-neon-cyan"
								>
									#{tag}
								</span>
							))}
						</div>
					)}

					{/* Post actions */}
					<div className="flex items-center space-x-4 mt-3 pt-2 border-t border-retro-light">
						<Button
							variant="ghost"
							size="sm"
							className={`text-xs px-2 flex items-center ${isLiked ? "text-neon-magenta" : "text-adaptive"}`}
							onClick={handleLike}
						>
							<Heart
								size={14}
								className={`mr-1 ${isLiked ? "fill-neon-magenta text-neon-magenta" : ""}`}
							/>
							{post.likes.length > 0 ? post.likes.length : ""}
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="text-xs px-2 flex items-center text-adaptive"
							onClick={() => setShowComments(!showComments)}
						>
							<MessageCircle size={14} className="mr-1" />
							{post.comments.length > 0 ? post.comments.length : ""}
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="text-xs px-2 flex items-center text-adaptive"
							onClick={handleShare}
						>
							<Share size={14} className="mr-1" />
						</Button>
					</div>

					{/* Comment section */}
					{showComments && <CommentSection post={post} />}
				</div>
			</div>
		</Card>
	);
};

export default MicroPostCard;
