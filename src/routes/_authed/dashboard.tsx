import PageHeader from "@/components/PageHeader";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MessageCircle, MessageSquare, Plus, Search } from "lucide-react";

import {
	mockConnections,
	mockMicroPosts,
	mockResources,
} from "@/data/mock-data";
import MicroPostCard from "@/features/microblog/MicroPostCard";
import ResourceCard from "@/features/resources/ResourceCard";

export const Route = createFileRoute("/_authed/dashboard")({
	component: Dashboard,
});

// Get most recent resources
const recentResources = [...mockResources]
	.sort(
		(a, b) =>
			new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime(),
	)
	.slice(0, 3);

// Get most recent micro posts
const recentPosts = [...mockMicroPosts]
	.sort(
		(a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
	)
	.slice(0, 2);
function Dashboard() {
	return (
		<ContentLayout
			breadcrumbs={{
				items: [
					{ label: "Home", href: "/dashboard" },
					{ label: "Dashboard", href: "/dashboard", isCurrentPage: true },
				],
			}}
		>
			<PageHeader
				title="Dashboard"
				subtitle={`Welcome back! ${new Date().toLocaleDateString()}`}
			/>

			<div className="mb-8 p-4 retro-container relative overflow-hidden">
				<div className="absolute inset-0 opacity-10">
					<div className="w-full h-full bg-grid-pattern" />
				</div>

				<div className="relative z-10">
					<div className="flex items-center mb-6">
						<div className="w-8 h-8 bg-neon-magenta rounded-full flex items-center justify-center mr-3">
							<MessageSquare size={16} className="text-retro-dark" />
						</div>
						<h2 className="text-xl font-pixel text-neon-magenta">
							AI Assistant
						</h2>
					</div>

					<div className="relative">
						<input
							type="text"
							placeholder="Ask about your projects, resources, or get recommendations..."
							className="w-full bg-retro-dark border border-retro-light text-adaptive p-3 pl-10 rounded-md focus:border-neon-magenta focus:outline-hidden"
						/>
						<Search
							size={18}
							className="absolute left-3 top-3.5 text-white/50"
						/>
					</div>

					<div className="mt-4 text-xs text-white/50 font-mono">
						Try: "Show me all resources tagged with React" or "What projects
						need my attention?"
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="col-span-1 lg:col-span-2 space-y-6">
					<section>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-pixel text-neon-cyan">CodeBytes</h2>
							<Link
								to="/microblog"
								className="retro-button flex items-center text-xs"
							>
								<MessageCircle size={14} className="mr-1" />
								View All
							</Link>
						</div>

						<div className="space-y-4">
							{recentPosts.length > 0 ? (
								recentPosts.map(
									(post) =>
										// <MicroPostCard key={post.id} post={post} />
										null,
								)
							) : (
								<div className="retro-card text-center p-6 text-adaptive">
									<p>No CodeBytes yet. Start sharing your coding journey!</p>
									<Link
										to="/microblog"
										className="text-neon-cyan mt-2 hover:underline block"
									>
										Create your first post
									</Link>
								</div>
							)}
						</div>
					</section>

					<section>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-pixel text-neon-green">
								Recent Resources
							</h2>
							<button
								type="button"
								className="retro-button flex items-center text-xs"
							>
								<Plus size={14} className="mr-1" />
								Add Resource
							</button>
						</div>

						<div className="space-y-4">
							{recentResources.map((resource) => (
								<ResourceCard key={resource._id} resource={resource} />
							))}
						</div>
					</section>
				</div>

				<div className="col-span-1">
					<section>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-pixel text-neon-blue">Network</h2>
						</div>

						<div className="retro-container p-4">
							<div className="text-sm font-pixel text-neon-blue mb-2">
								Your Connections ({mockConnections.length})
							</div>

							{mockConnections.map((connection) => (
								<div
									key={connection.id}
									className="flex items-center mb-3 last:mb-0"
								>
									<img
										src={connection.avatar}
										alt={connection.name}
										className="w-8 h-8 rounded-md mr-2"
									/>
									<div>
										<div className="text-sm text-white">{connection.name}</div>
										<div className="text-xs text-white/50">
											{connection.github}
										</div>
									</div>
								</div>
							))}

							<button
								type="button"
								className="w-full retro-button text-xs mt-4"
							>
								<Plus size={14} className="mr-1 inline-block" />
								Find Connections
							</button>
						</div>
					</section>
				</div>
			</div>
		</ContentLayout>
	);
}
