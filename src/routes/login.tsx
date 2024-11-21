import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const fallback = "/dashboard" as const;

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		redirect: z.string().optional().catch(""),
	}),
	beforeLoad: ({ context, search }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: search.redirect || fallback });
		}
	},
	component: () => {
		const { signIn } = useAuthActions();
		return (
			<Button onClick={() => void signIn("github")}>Sign in with GitHub</Button>
		);
	},
});
