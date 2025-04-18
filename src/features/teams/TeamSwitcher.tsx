import { ChevronsUpDown, Plus, Users } from "lucide-react";
import * as React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Route } from "@/routes/_authed";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex-server/_generated/api";
import type { Doc, Id } from "@convex-server/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

// Default icons for teams without custom icons
const TeamIcon = Users;

export function TeamSwitcher() {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const { userId } = Route.useRouteContext();

	// Fetch user's teams
	const { data: teams } = useSuspenseQuery(
		convexQuery(api.teams.getUserTeams, { userId }),
	);

	// Set active team based on route or default to first team
	const [activeTeamId, setActiveTeamId] = React.useState<Id<"teams"> | null>(
		null,
	);

	React.useEffect(() => {
		if (teams && teams.length > 0 && !activeTeamId) {
			setActiveTeamId(teams[0]._id);
		}
	}, [teams, activeTeamId]);

	// Find the active team object
	const activeTeam =
		teams && activeTeamId
			? teams.find((team: Doc<"teams">) => team._id === activeTeamId)
			: null;

	// Handle team switching
	const handleTeamChange = (teamId: Id<"teams">) => {
		setActiveTeamId(teamId);
		// Optional: Navigate to team page
		// router.navigate({ to: `/teams/${teamId}` });
	};

	// Handle new team creation
	const handleCreateTeam = () => {
		// Navigate to team creation page - use a valid route
		router.navigate({ to: "/teams" });
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							{activeTeam ? (
								<>
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
										<TeamIcon className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{activeTeam.name}
										</span>
										<span className="truncate text-xs">
											{activeTeam.visibility}
										</span>
									</div>
									<ChevronsUpDown className="ml-auto" />
								</>
							) : (
								<div className="flex items-center gap-2">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
										<TeamIcon className="size-4" />
									</div>
									<span className="text-sm">No team selected</span>
									<ChevronsUpDown className="ml-auto" />
								</div>
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							Teams
						</DropdownMenuLabel>
						{teams && teams.length > 0 ? (
							teams.map((team: Doc<"teams">, index: number) => (
								<DropdownMenuItem
									key={team._id}
									onClick={() => handleTeamChange(team._id)}
									className="gap-2 p-2"
								>
									<div className="flex size-6 items-center justify-center rounded-sm border">
										<TeamIcon className="size-4 shrink-0" />
									</div>
									{team.name}
									<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
								</DropdownMenuItem>
							))
						) : (
							<DropdownMenuItem
								disabled
								className="text-sm text-muted-foreground"
							>
								No teams found
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleCreateTeam} className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<Plus className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">Add team</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
