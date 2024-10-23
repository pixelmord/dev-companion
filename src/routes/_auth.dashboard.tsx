import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";

import { convexQuery } from "@convex-dev/react-query";
export const Route = createFileRoute("/_auth/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	const { data } = useQuery(convexQuery(api.tasks.get, {}));
	return (
		<>
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="#">
									Building Your Application
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Data Fetching</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				{data?.map((task) => (
					<div
						key={task._id}
						className="p-4 bg-muted/50 rounded-xl flex space-x-2"
					>
						<h3 className="text-lg font-semibold">{task.text}</h3>
						<p>{task.isCompleted && "✅"}</p>
					</div>
				))}
				<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
			</div>
		</>
	);
}
