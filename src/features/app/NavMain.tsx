import { ChevronRight } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { objectKeys } from "ts-extras";
import type { NavigationGroups } from "./AppSidebar";

export function NavMain({
	items,
}: {
	items: NavigationGroups;
}) {
	return (
		<>
			{objectKeys(items).map((key) => (
				<SidebarGroup key={key}>
					{items[key].label && (
						<SidebarGroupLabel>{items[key].label}</SidebarGroupLabel>
					)}
					{items[key].links && items[key].links.length > 0 && (
						<SidebarMenu>
							{items[key].links.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton asChild>
										<Link to={item.to}>
											{item.icon && <item.icon />}
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					)}
					{items[key].items && items[key].items.length > 0 && (
						<SidebarMenu>
							{items[key].items?.map((item) => (
								<Collapsible
									key={item.title}
									asChild
									defaultOpen={item.isOpen}
									className="group/collapsible"
								>
									<SidebarMenuItem key={item.title}>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton tooltip={item.title}>
												{item.icon && <item.icon />}
												<span>{item.title}</span>
												<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.links.map((subItem) => (
													<SidebarMenuSubItem key={subItem.label}>
														<SidebarMenuSubButton asChild>
															<Link to={subItem.to}>
																<span>{subItem.label}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							))}
						</SidebarMenu>
					)}
				</SidebarGroup>
			))}
		</>
	);
}
