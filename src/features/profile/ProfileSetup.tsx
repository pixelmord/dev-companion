import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/clerk-react";
import type { Doc } from "@convex-server/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { TeamManagement } from "./TeamManagement";
import { useCreateProfile } from "./profile-queries";

export type ProfileCreateSchemaType = Omit<
	Partial<Doc<"users">>,
	"_id" | "_creationTime" | "updatedAt" | "clerkId" | "role" | "lastActive"
>;

const schema = z.object({
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address"),
	bio: z.string(),
	avatarUrl: z.string(),
	preferences: z.object({
		theme: z.enum(["light", "dark", "system"]).default("system"),
		notifications: z.boolean().default(true),
		emailDigest: z.boolean().default(false),
	}),
});

export function ProfileSetup() {
	const { user } = useUser();
	const navigate = useNavigate();
	const { mutate: createProfile } = useCreateProfile();
	const [activeTab, setActiveTab] = useState<
		"profile" | "preferences" | "teams"
	>("profile");

	const form = useAppForm({
		defaultValues: schema.parse({
			name: user?.fullName || "",
			email: user?.primaryEmailAddress?.emailAddress || "",
			bio: "",
			avatarUrl: user?.imageUrl || "",
			preferences: {
				theme: "system",
				notifications: true,
				emailDigest: false,
			},
		}),
		validators: {
			onBlur: ({ value }) => {
				try {
					schema.parse(value);
					return {};
				} catch (error) {
					if (error instanceof z.ZodError) {
						return {
							fields: Object.fromEntries(
								error.errors.map((err) => [err.path.join("."), err.message]),
							),
						};
					}
					return {};
				}
			},
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

	// Calculate profile completion percentage
	const requiredFields = ["name", "email"] as const;
	const optionalFields = ["bio", "avatarUrl"] as const;
	const completedRequired = requiredFields.filter(
		(field) => form.state.values[field]?.length > 0,
	).length;
	const completedOptional = optionalFields.filter(
		(field) => form.state.values[field]?.length > 0,
	).length;
	const completionPercentage =
		((completedRequired * 2 + completedOptional) /
			(requiredFields.length * 2 + optionalFields.length)) *
		100;

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
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Complete Your Profile</CardTitle>
						<CardDescription>
							Please provide some information about yourself to get started.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Profile Completion</span>
								<span>{Math.round(completionPercentage)}%</span>
							</div>
							<Progress value={completionPercentage} className="h-2" />
						</div>
					</CardContent>
				</Card>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="profile">Profile Information</TabsTrigger>
						<TabsTrigger value="preferences">Preferences</TabsTrigger>
						<TabsTrigger value="teams">Teams</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Tell us about yourself.</CardDescription>
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
							<CardFooter className="flex justify-between">
								<div />
								<button
									type="button"
									onClick={() => setActiveTab("preferences")}
									className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
								>
									Next: Preferences
								</button>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="preferences">
						<Card>
							<CardHeader>
								<CardTitle>Your Preferences</CardTitle>
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
							<CardFooter className="flex justify-between">
								<button
									type="button"
									onClick={() => setActiveTab("profile")}
									className="px-4 py-2 text-sm font-medium text-primary bg-transparent border border-primary rounded-md hover:bg-primary/10"
								>
									Back to Profile
								</button>
								<form.AppForm>
									<form.SubscribeButton label="Complete Setup" />
								</form.AppForm>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="teams">
						<TeamManagement />
					</TabsContent>
				</Tabs>
			</form>
		</div>
	);
}
