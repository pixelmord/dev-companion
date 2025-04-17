import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MicroPost } from "@/data/mock-data";
import { SendHorizontal } from "lucide-react";

interface CommentSectionProps {
	post: MicroPost;
}

const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
	const [comment, setComment] = useState("");

	const handleSubmitComment = (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentUser || !comment.trim()) return;

		const newComment: MicroPostComment = {
			id: uuidv4(),
			userId: currentUser.id,
			content: comment,
			postedAt: new Date().toISOString(),
		};

		addMicroPostComment(post.id, newComment);
		setComment("");
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return (
			date.toLocaleDateString() +
			" @ " +
			date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		);
	};

	const getUser = (userId: string) => {
		if (currentUser?.id === userId) return currentUser;
		return connections.find((user) => user.id === userId) || null;
	};

	return (
		<div className="mt-4 border-t border-retro-light pt-4">
			{/* Comments list */}
			<div className="space-y-3 mb-4">
				{post.comments.length > 0 ? (
					post.comments.map((comment) => {
						const commentUser = getUser(comment.userId);
						return (
							<div key={comment.id} className="flex space-x-2">
								<div className="shrink-0">
									{commentUser && (
										<img
											src={commentUser.avatar}
											alt={commentUser.name}
											className="w-6 h-6 rounded-sm"
										/>
									)}
								</div>
								<div className="grow bg-retro-dark p-2 rounded-sm text-sm">
									<div className="flex justify-between items-start">
										<span className="font-pixel text-neon-cyan text-xs">
											{commentUser?.name || "Unknown User"}
										</span>
										<span className="text-white/40 text-[10px]">
											{formatDate(comment.postedAt)}
										</span>
									</div>
									<p className="mt-1 text-adaptive">{comment.content}</p>
								</div>
							</div>
						);
					})
				) : (
					<p className="text-sm text-white/50 italic">
						No comments yet. Be the first to comment!
					</p>
				)}
			</div>

			{/* Add comment form */}
			{currentUser && (
				<form onSubmit={handleSubmitComment} className="flex space-x-2">
					<Textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Write a comment..."
						className="text-sm min-h-[60px] bg-retro-dark text-adaptive resize-none grow"
					/>
					<Button
						type="submit"
						size="sm"
						variant="ghost"
						disabled={!comment.trim()}
						className="mt-auto"
					>
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
						<SendHorizontal size={14} className="text-neon-cyan" />
					</Button>
				</form>
			)}
		</div>
	);
};

export default CommentSection;
