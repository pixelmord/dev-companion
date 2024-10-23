import { Link, createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
export const Route = createFileRoute("/")({
	component: () => (
		<>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
				Hello !
			</h1>
			<Unauthenticated>
				<Link to="/login" className="text-blue-500 hover:opacity-75">
					Login
				</Link>
			</Unauthenticated>
			<Authenticated>
				<Link to="/dashboard" className="text-blue-500 hover:opacity-75">
					Dashboard
				</Link>
			</Authenticated>
		</>
	),
});
