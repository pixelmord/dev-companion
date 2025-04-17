import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BarChart2, FileText, Github, Star } from "lucide-react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="px-4 lg:px-6 h-14 flex items-center">
				<Link className="flex items-center justify-center" to="/">
					<FileText className="h-6 w-6 mr-2" />
					<span className="font-bold">DevCompanion</span>
				</Link>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<Link
						className="text-sm font-medium hover:underline underline-offset-4"
						to="/"
						hash="features"
					>
						Features
					</Link>
					<Link
						className="text-sm font-medium hover:underline underline-offset-4"
						to="/"
						hash="about"
					>
						About
					</Link>
					<a
						className="text-sm font-medium hover:underline underline-offset-4"
						href="https://github.com/pixelmord/dev-companion"
					>
						GitHub
					</a>
				</nav>
			</header>
			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="space-y-2">
								<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
									Your Ultimate Developer Companion
								</h1>
								<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
									Explore, plan, and create with ease. DevCompanion is your free
									and open-source toolkit for better development workflows.
								</p>
							</div>
							<div className="space-x-4">
								<Button asChild>
									<a href="https://github.com/devcompanion">Get Started</a>
								</Button>
								<Button variant="outline" asChild>
									<Link to="/" hash="features">
										Learn More
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
				<section
					id="features"
					className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
				>
					<div className="container px-4 md:px-6">
						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
							Features
						</h2>
						<div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
							<Card>
								<CardHeader>
									<Github className="h-8 w-8 mb-2" />
									<CardTitle>GitHub Explorer</CardTitle>
								</CardHeader>
								<CardContent>
									Dive into the profiles of GitHub users you follow. Discover
									their projects and starred repositories with ease.
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<FileText className="h-8 w-8 mb-2" />
									<CardTitle>Visual Planning</CardTitle>
								</CardHeader>
								<CardContent>
									Create architectural design documents visually. Plan your
									projects with intuitive tools and interfaces.
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<BarChart2 className="h-8 w-8 mb-2" />
									<CardTitle>Prioritize & Estimate</CardTitle>
								</CardHeader>
								<CardContent>
									Efficiently manage your tasks. Prioritize your work and
									estimate efforts with our specialized tools.
								</CardContent>
							</Card>
						</div>
					</div>
				</section>
				<section id="about" className="w-full py-12 md:py-24 lg:py-32">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
									Free & Open Source
								</h2>
								<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
									DevCompanion is completely free and open source. Contribute,
									customize, and make it your own.
								</p>
							</div>
							<div className="flex items-center justify-center space-x-4">
								<Star className="h-6 w-6 text-yellow-500" />
								<span className="text-xl font-bold">Star us on GitHub</span>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
								Ready to Boost Your Workflow?
							</h2>
							<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
								Join thousands of developers who are already using DevCompanion
								to streamline their development process.
							</p>
							<Button size="lg" asChild>
								<a href="https://github.com/devcompanion">Get Started Now</a>
							</Button>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
				<p className="text-xs text-gray-500 dark:text-gray-400">
					© 2024 DevCompanion. All rights reserved.
				</p>
				<nav className="sm:ml-auto flex gap-4 sm:gap-6">
					<Link className="text-xs hover:underline underline-offset-4" to="/">
						Terms of Service
					</Link>
					<Link className="text-xs hover:underline underline-offset-4" to="/">
						Privacy
					</Link>
				</nav>
			</footer>
		</div>
	);
}
