import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	preferences: z.object({
		theme: z.enum(["light", "dark", "system"]),
		notifications: z.boolean(),
		emailDigest: z.boolean(),
	}),
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
			preferences: profile?.preferences || {
				theme: "system",
				notifications: true,
				emailDigest: true,
			},
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
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="profile">Profile Information</TabsTrigger>
						<TabsTrigger value="preferences">Preferences</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									Update your personal information and bio.
								</CardDescription>
							</CardHeader>
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
						</Card>
					</TabsContent>

					<TabsContent value="preferences">
						<Card>
							<CardHeader>
								<CardTitle>User Preferences</CardTitle>
								<CardDescription>
									Customize your app experience and notification settings.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-medium">Theme</h3>
										<p className="text-sm text-muted-foreground">
											Choose your preferred color theme.
										</p>
										<form.AppField name="preferences.theme">
											{(field) => (
												<field.RadioGroup
													label="Theme"
													options={[
														{ label: "Light", value: "light" },
														{ label: "Dark", value: "dark" },
														{ label: "System", value: "system" },
													]}
												/>
											)}
										</form.AppField>
									</div>

									<Separator />

									<div className="space-y-4">
										<h3 className="text-lg font-medium">Notifications</h3>
										<div className="space-y-4">
											<form.AppField name="preferences.notifications">
												{(field) => (
													<field.Switch
														label="Push Notifications"
														description="Receive notifications about updates and activity."
													/>
												)}
											</form.AppField>

											<form.AppField name="preferences.emailDigest">
												{(field) => (
													<field.Switch
														label="Email Digest"
														description="Receive weekly email summaries of your activity."
													/>
												)}
											</form.AppField>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<Card>
					<CardFooter className="flex justify-end space-x-2">
						<form.AppForm>
							<form.SubscribeButton label="Save Changes" />
						</form.AppForm>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
