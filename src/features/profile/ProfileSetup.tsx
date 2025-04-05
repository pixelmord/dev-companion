import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/clerk-react";
import type { Doc } from "@convex-server/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useFormPersistence } from "../form/use-form-persistence";
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
	const { mutate: createProfile, isPending } = useCreateProfile();
	const [activeTab, setActiveTab] = useState<
		"profile" | "preferences" | "teams"
	>("profile");
	const [hasChanges, setHasChanges] = useState(false);
	const [showDiscardDialog, setShowDiscardDialog] = useState(false);
	const [nextTab, setNextTab] = useState<
		"profile" | "preferences" | "teams" | null
	>(null);

	const defaultValues = useMemo(
		() => ({
			name: user?.fullName || "",
			email: user?.primaryEmailAddress?.emailAddress || "",
			bio: "",
			avatarUrl: user?.imageUrl || "",
			preferences: {
				theme: "system" as const,
				notifications: true,
				emailDigest: false,
			},
		}),
		[user?.fullName, user?.primaryEmailAddress?.emailAddress, user?.imageUrl],
	);

	const form = useAppForm({
		defaultValues,
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
				clearSavedState();
				navigate({ to: "/dashboard" });
			} catch (error) {
				toast.error("Failed to create profile. Please try again.");
				console.error("Profile creation error:", error);
			}
		},
	});

	const { isSaving, clearSavedState } = useFormPersistence({
		storageKey: `profile-setup-${user?.id}`,
		onStateChange: () => {
			setHasChanges(true);
		},
	});

	// Track form changes by comparing current values with default values
	useEffect(() => {
		const hasFormChanges =
			JSON.stringify(form.state.values) !== JSON.stringify(defaultValues);
		setHasChanges(hasFormChanges);
	}, [form.state.values, defaultValues]);

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

	const handleTabChange = (value: string) => {
		if (hasChanges) {
			setNextTab(value as "profile" | "preferences" | "teams");
			setShowDiscardDialog(true);
			return;
		}
		setActiveTab(value as "profile" | "preferences" | "teams");
	};

	return (
		<div className="container mx-auto max-w-2xl p-4">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
				aria-label="Profile setup form"
			>
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Complete Your Profile</CardTitle>
						<CardDescription>
							Please provide some information about yourself to get started.
							{isSaving && (
								<span className="text-muted-foreground ml-2">
									Saving changes...
								</span>
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Profile Completion</span>
								<span aria-label="Profile completion percentage">
									{Math.round(completionPercentage)}%
								</span>
							</div>
							<Progress
								value={completionPercentage}
								className="h-2"
								aria-label="Profile completion progress"
								role="progressbar"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(completionPercentage)}
							/>
						</div>
					</CardContent>
				</Card>

				<Tabs
					value={activeTab}
					onValueChange={handleTabChange}
					className="w-full"
					aria-label="Profile setup sections"
				>
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
								<div className="flex flex-col items-center gap-4 mb-6">
									<Avatar className="w-24 h-24">
										<AvatarImage
											src={form.state.values.avatarUrl}
											alt={form.state.values.name}
										/>
										<AvatarFallback>
											{form.state.values.name.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// TODO: Implement avatar upload
										}}
										type="button"
										aria-label="Upload profile picture"
									>
										Upload Picture
									</Button>
								</div>

								<form.AppField name="name">
									{(field) => (
										<field.TextField
											label="Full Name"
											placeholder="Enter your full name"
											required
											aria-required="true"
										/>
									)}
								</form.AppField>

								<form.AppField name="email">
									{(field) => (
										<field.TextField
											label="Email"
											type="email"
											placeholder="Enter your email"
											required
											aria-required="true"
										/>
									)}
								</form.AppField>

								<form.AppField name="bio">
									{(field) => (
										<field.TextArea
											label="Bio"
											placeholder="Tell us a bit about yourself"
											aria-label="Biography"
										/>
									)}
								</form.AppField>
							</CardContent>
							<CardFooter className="flex justify-between">
								<div />
								<Button
									type="button"
									onClick={() => setActiveTab("preferences")}
									disabled={isPending}
								>
									Next: Preferences
								</Button>
							</CardFooter>
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
							<CardFooter className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									onClick={() => setActiveTab("profile")}
									disabled={isPending}
								>
									Back
								</Button>
								<Button
									type="button"
									onClick={() => setActiveTab("teams")}
									disabled={isPending}
								>
									Next: Teams
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="teams">
						<Card>
							<CardHeader>
								<CardTitle>Team Setup</CardTitle>
								<CardDescription>
									Create or join teams to collaborate with others.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<TeamManagement />
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									onClick={() => setActiveTab("preferences")}
									disabled={isPending}
								>
									Back
								</Button>
								<Button
									type="submit"
									disabled={isPending}
									className="min-w-[120px]"
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										"Complete Setup"
									)}
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</form>

			<AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard Changes?</AlertDialogTitle>
						<AlertDialogDescription>
							You have unsaved changes. Are you sure you want to discard them?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setHasChanges(false);
								if (nextTab) {
									setActiveTab(nextTab);
									setNextTab(null);
								}
								setShowDiscardDialog(false);
							}}
						>
							Discard Changes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
