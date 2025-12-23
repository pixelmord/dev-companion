import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Filter, Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { Task } from "../../types/task";
import TaskCard from "./TaskCard";

interface TaskSidebarProps {
	tasks: Task[];
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ tasks }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPriority, setFilterPriority] = useState<string[]>([
		"high",
		"medium",
		"low",
	]);

	// Filter the tasks based on search term and selected priorities
	const filteredTasks = tasks.filter((task) => {
		const matchesSearch =
			task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			task.description.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesPriority = filterPriority.includes(task.priority);

		return matchesSearch && matchesPriority;
	});

	// Toggle a priority filter
	const togglePriority = (value: string) => {
		setFilterPriority((current) =>
			current.includes(value)
				? current.filter((priority) => priority !== value)
				: [...current, value],
		);
	};

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel
				defaultSize={20}
				minSize={15}
				maxSize={25}
				className="bg-retro-medium border-l border-retro-light h-full"
			>
				<div className="p-3 flex flex-col h-full">
					<h3 className="font-pixel text-neon-blue mb-3">Available Tasks</h3>

					<div className="flex gap-2 mb-3">
						<div className="relative flex-1">
							<Search
								className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40"
								size={16}
							/>
							<Input
								placeholder="Search tasks..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8 bg-retro-dark border-retro-light text-sm"
							/>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="bg-retro-dark border-retro-light hover:bg-retro-light"
								>
									<Filter size={16} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="bg-retro-dark border-retro-light">
								<DropdownMenuCheckboxItem
									checked={filterPriority.includes("high")}
									onCheckedChange={() => togglePriority("high")}
									className="text-neon-magenta"
								>
									High Priority
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={filterPriority.includes("medium")}
									onCheckedChange={() => togglePriority("medium")}
									className="text-neon-yellow"
								>
									Medium Priority
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={filterPriority.includes("low")}
									onCheckedChange={() => togglePriority("low")}
									className="text-neon-cyan"
								>
									Low Priority
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="overflow-y-auto custom-scrollbar flex-1">
						<div className="space-y-2">
							{filteredTasks.length > 0 ? (
								filteredTasks.map((task) => (
									<div key={task.id} className="task-card-container">
										<TaskCard task={task} compact={true} />
									</div>
								))
							) : (
								<div className="text-center text-white/40 py-4">
									No tasks match your filters
								</div>
							)}
						</div>
					</div>

					<div className="mt-3 text-center text-xs text-white/50">
						Drag tasks to the matrix to prioritize them
					</div>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
		</ResizablePanelGroup>
	);
};

export default TaskSidebar;
