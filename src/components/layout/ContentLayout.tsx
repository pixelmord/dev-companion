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
import { Fragment, type ReactNode } from "react";
// import { ModeToggle } from "../ModeToggle";

interface ContentLayoutProps {
	children: ReactNode;
	breadcrumbs?: {
		items: {
			href?: string;
			label: string;
			isCurrentPage?: boolean;
		}[];
	};
}

export function ContentLayout({ children, breadcrumbs }: ContentLayoutProps) {
	return (
		<>
			<header className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					{breadcrumbs && (
						<Breadcrumb>
							<BreadcrumbList>
								{breadcrumbs.items.map((item, index) => (
									<Fragment key={item.label}>
										<BreadcrumbItem className="hidden md:block">
											{item.isCurrentPage ? (
												<BreadcrumbPage>{item.label}</BreadcrumbPage>
											) : (
												<BreadcrumbLink href={item.href ?? "#"}>
													{item.label}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
										{index < breadcrumbs.items.length - 1 && (
											<BreadcrumbSeparator className="hidden md:block" />
										)}
									</Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					)}
				</div>
				<div className="flex items-center gap-2 px-4">
					<Separator orientation="vertical" className="mr-2 h-4" />
					{/* <ModeToggle /> */}
				</div>
			</header>
			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min m-4 p-4">
				{children}
			</div>
		</>
	);
}
