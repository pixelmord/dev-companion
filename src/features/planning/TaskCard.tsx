import { useDraggable } from "@dnd-kit/core";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import type React from "react";
import type { Task } from "../../types/task";

interface TaskCardProps {
	task: Task;
	compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: task.id,
		});

	// Format the due date to show relative time
	const dueDate = new Date(task.dueDate);
	const dueString = formatDistanceToNow(dueDate, { addSuffix: true });

	// Apply styles based on priority
	let priorityColor = "";
	switch (task.priority) {
		case "high":
			priorityColor = "border-l-neon-magenta";
			break;
		case "medium":
			priorityColor = "border-l-neon-yellow";
			break;
		case "low":
			priorityColor = "border-l-neon-cyan";
			break;
		default:
			priorityColor = "border-l-gray-500";
	}

	// Dynamic styles for dragging
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				zIndex: 100,
				opacity: 0.8,
			}
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={`
        bg-retro-medium border border-retro-light rounded-md 
        cursor-grab active:cursor-grabbing p-2 ${priorityColor} border-l-2
        ${isDragging ? "shadow-lg" : ""}
        select-none
        ${compact ? "py-1.5" : ""}
      `}
		>
			<div className="flex justify-between items-start">
				<h4
					className={`text-white font-medium truncate max-w-[75%] ${compact ? "text-sm" : "text-base"}`}
				>
					{task.title}
				</h4>
				<div
					className={`bg-retro-dark px-1.5 py-0.5 rounded text-white/70 text-xs ${compact ? "hidden" : ""}`}
				>
					{task.project}
				</div>
			</div>

			{!compact && (
				<p className="text-white/60 text-xs mt-1 line-clamp-2">
					{task.description}
				</p>
			)}

			<div className="flex items-center justify-between mt-1">
				<div
					className={`flex items-center text-white/50 ${compact ? "text-xs" : "text-xs"}`}
				>
					<Clock size={compact ? 12 : 14} className="mr-1" />
					<span>{dueString}</span>
				</div>

				{!compact && task.status && (
					<div className="text-xs px-1.5 py-0.5 rounded-sm bg-retro-light text-white/70">
						{task.status}
					</div>
				)}
			</div>
		</div>
	);
};

export default TaskCard;
