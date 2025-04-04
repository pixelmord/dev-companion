import { Route } from "@/routes/_authed/profile";
import type { Id } from "@convex-server/_generated/dataModel";
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

import { useGetProfile, useUpdateProfile } from "./profile-queries";

const schema = z.object({
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address"),
	bio: z.string(),
	avatarUrl: z.string(),
});

export function ProfileEdit() {
	const { userId } = Route.useLoaderData();
	const { data: profile } = useGetProfile(userId);
	const { mutate: updateProfile } = useUpdateProfile();

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
				if (!profile) {
					throw new Error("Profile not found");
				}
				await updateProfile({
					id: profile._id as Id<"users">,
					...value,
				});
				toast.success("Profile updated successfully!");
			} catch (error) {
				toast.error("Failed to update profile. Please try again.");
				console.error("Profile update error:", error);
			}
		},
	});

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
