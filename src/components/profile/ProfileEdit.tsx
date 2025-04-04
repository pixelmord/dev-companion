import { useUser } from "@clerk/clerk-react";
import { api } from "@convex-server/_generated/api";
import type { Id } from "@convex-server/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "../../hooks/form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

const schema = z.object({
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address"),
	bio: z.string(),
	avatarUrl: z.string(),
});

export function ProfileEdit() {
	const { user } = useUser();
	const profile = useQuery(api.users.getProfile, { clerkId: user?.id || "" });
	const updateProfile = useMutation(api.users.updateProfile);

	const form = useAppForm({
		defaultValues: {
			name: profile?.name || "",
			email: profile?.email || "",
			bio: profile?.bio || "",
			avatarUrl: profile?.avatarUrl || "",
		},
		validators: {
			onBlur: schema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateProfile({
					id: profile?._id as Id<"users">,
					...value,
				});
				toast.success("Profile updated successfully!");
			} catch (error) {
				toast.error("Failed to update profile. Please try again.");
				console.error("Profile update error:", error);
			}
		},
	});

	if (!profile) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>Edit Profile</CardTitle>
					<CardDescription>Update your profile information.</CardDescription>
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
							<form.SubscribeButton label="Save Changes" />
						</form.AppForm>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
