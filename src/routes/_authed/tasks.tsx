import { ContentLayout } from "@/components/layout/ContentLayout";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export const Route = createFileRoute("/_authed/tasks")({
	component: Tasks,
});

function Tasks() {
	const [text, setText] = useState("");
	const tasks = useQuery(api.tasks.getTasks, {});
	const createTask = useMutation(api.tasks.createTask);
	const updateTask = useMutation(api.tasks.updateTask);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim()) return;

		createTask({ text });
		setText("");
	};

	const toggleTask = (id: Id<"tasks">, currentStatus: boolean) => {
		updateTask({ id, isCompleted: !currentStatus });
	};

	return (
		<ContentLayout
			breadcrumbs={{
				items: [
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Tasks", isCurrentPage: true },
				],
			}}
		>
			<div className="max-w-2xl mx-auto space-y-8">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Add a new task..."
						className="flex-1"
					/>
					<Button type="submit">Add Task</Button>
				</form>

				<div className="space-y-4">
					{tasks?.map((task) => (
						<div
							key={task._id}
							className="p-4 bg-muted/50 rounded-xl flex items-center justify-between"
						>
							<div className="flex items-center gap-4">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => toggleTask(task._id, task.isCompleted)}
									className={
										task.isCompleted ? "text-green-500" : "text-gray-400"
									}
								>
									{task.isCompleted ? "✓" : "○"}
								</Button>
								<h3
									className={`text-lg ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
								>
									{task.text}
								</h3>
							</div>
						</div>
					))}
				</div>
			</div>
		</ContentLayout>
	);
}
