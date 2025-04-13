import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	type LucideIcon,
	Map as MapIcon,
	PieChart,
	Settings2,
	SquareTerminal,
	Users,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/features/app/NavMain";
import { NavUser } from "@/features/profile/NavUser";
import { NavProjects } from "@/features/projects/NavProjects";
import { TeamSwitcher } from "@/features/teams/TeamSwitcher";

import type { Doc } from "@convex-server/_generated/dataModel";
import { type LinkOptions, linkOptions } from "@tanstack/react-router";
import type { ComponentProps } from "react";

// This is sample data.
const data = {
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Network",
			url: "#",
			icon: SquareTerminal,
			isActive: true,
			items: [
				{
					title: "Overview",
					url: "#",
				},
				{
					title: "Following",
					url: "#",
				},
				{
					title: "Starred",
					url: "#",
				},
			],
		},
		{
			title: "Tools",
			url: "#",
			icon: Bot,
			items: [
				{
					title: "Tasks",
					url: "/tasks",
				},
				{
					title: "Boards",
					url: "/boards",
				},
				{
					title: "Quantum",
					url: "#",
				},
			],
		},
		{
			title: "Documentation",
			url: "#",
			icon: BookOpen,
			items: [
				{
					title: "Introduction",
					url: "#",
				},
				{
					title: "Get Started",
					url: "#",
				},
				{
					title: "Tutorials",
					url: "#",
				},
				{
					title: "Changelog",
					url: "#",
				},
			],
		},
		{
			title: "Settings",
			url: "#",
			icon: Settings2,
			items: [
				{
					title: "General",
					url: "#",
				},
				{
					title: "Team",
					url: "#",
				},
				{
					title: "Billing",
					url: "#",
				},
				{
					title: "Limits",
					url: "#",
				},
			],
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: Frame,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: PieChart,
		},
		{
			name: "Travel",
			url: "#",
			icon: MapIcon,
		},
	],
};

const navigationGroups = {
	dashboard: {
		links: linkOptions([
			{
				to: "/dashboard",
				label: "Dashboard",
				activeOptions: { exact: true },
			},
		]),
	},
	platform: {
		label: "Platform",
		items: [
			{
				title: "Teams",
				icon: Users,
				isOpen: true,
				links: linkOptions([
					{
						to: "/teams",
						label: "Teams",
					},
				]),
			},
			{
				title: "Tools",
				icon: Bot,
				isOpen: true,
				links: linkOptions([
					{
						to: "/tasks",
						label: "Tasks",
					},
					{
						to: "/boards",
						label: "Boards",
					},
				]),
			},
		],
	},
};

export type NavigationLink = LinkOptions &
	Readonly<{
		label: string;
		icon?: LucideIcon;
	}>;
export type NavigationGroups = Record<
	keyof typeof navigationGroups,
	{
		label?: string;
		items?: {
			title: string;
			icon?: LucideIcon;
			isOpen?: boolean;
			links: Readonly<NavigationLink[]>;
		}[];
		links?: Readonly<NavigationLink[]>;
	}
>;

export function AppSidebar({
	userProfile,
	...props
}: ComponentProps<typeof Sidebar> & { userProfile: Doc<"users"> }) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navigationGroups} />
				<NavProjects projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				{!!userProfile && <NavUser user={userProfile} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
