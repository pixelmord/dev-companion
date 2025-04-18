import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface ScrollablePreviewProps {
	content: string;
	className?: string;
}

export function ScrollablePreview({
	content,
	className,
}: ScrollablePreviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Ensure the container is properly set up for scrolling
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.style.overflow = "auto";
			containerRef.current.style.height = "100%";
			containerRef.current.style.maxHeight = "100%";
		}
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn("h-full p-6 bg-card", className)}
			style={{
				overflow: "auto",
				height: "100%",
				maxHeight: "100%",
				WebkitOverflowScrolling: "touch",
			}}
		>
			<article className="prose prose-slate dark:prose-invert max-w-none">
				<ReactMarkdown>{content}</ReactMarkdown>
			</article>
		</div>
	);
}
