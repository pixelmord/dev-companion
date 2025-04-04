import { useUser } from "@clerk/clerk-react";
import { api } from "@convex-server/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { z } from "zod";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "../../components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { useAppForm } from "../form/form";
import { useCreateProfile } from "./profile-queries";

const schema = z.object({
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address"),
	bio: z.string(),
	avatarUrl: z.string(),
});

export function ProfileSetup() {
	const { user } = useUser();
	const navigate = useNavigate();
	const { mutate: createProfile } = useCreateProfile();

	const form = useAppForm({
		defaultValues: {
			name: user?.fullName || "",
			email: user?.primaryEmailAddress?.emailAddress || "",
			bio: "",
			avatarUrl: user?.imageUrl || "",
		},
		validators: {
			onBlur: schema,
		},
		onSubmit: async ({ value }) => {
			try {
				await createProfile({
					...value,
					clerkId: user?.id || "",
				});
				toast.success("Profile created successfully!");
				navigate({ to: "/dashboard" });
			} catch (error) {
				toast.error("Failed to create profile. Please try again.");
				console.error("Profile creation error:", error);
			}
		},
	});

	return (
		<div className="container mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>Complete Your Profile</CardTitle>
					<CardDescription>
						Please provide some information about yourself to get started.
					</CardDescription>
				</CardHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<CardContent className="space-y-6">
						<div className="flex justify-center mb-6">
							<Avatar className="w-24 h-24">
								<AvatarImage
									src={form.state.values.avatarUrl}
									alt={form.state.values.name}
								/>
								<AvatarFallback>
									{form.state.values.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</div>

						<form.AppField name="name">
							{(field) => (
								<field.TextField
									label="Full Name"
									placeholder="Enter your full name"
								/>
							)}
						</form.AppField>

						<form.AppField name="email">
							{(field) => (
								<field.TextField
									label="Email"
									type="email"
									placeholder="Enter your email"
								/>
							)}
						</form.AppField>

						<form.AppField name="bio">
							{(field) => (
								<field.TextArea
									label="Bio"
									placeholder="Tell us a bit about yourself"
								/>
							)}
						</form.AppField>
					</CardContent>
					<CardFooter className="flex justify-end space-x-2">
						<form.AppForm>
							<form.SubscribeButton label="Complete Setup" />
						</form.AppForm>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
