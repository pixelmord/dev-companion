import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { api } from "@convex-server/_generated/api";
import type { Id } from "@convex-server/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "../form/form";

const createTeamSchema = z.object({
	name: z.string().min(3, "Team name must be at least 3 characters long"),
	description: z.string(),
	visibility: z.enum(["public", "private"]),
	settings: z.object({
		allowInvites: z.boolean(),
		defaultRole: z.enum(["admin", "member"]),
		notificationsEnabled: z.boolean(),
	}),
});

export function TeamManagement({ userId }: { userId: Id<"users"> }) {
	const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
	const createTeam = useMutation(api.teams.createTeam);
	const userTeams = useQuery(api.teams.getUserTeams, { userId: userId });

	const form = useAppForm({
		defaultValues: {
			name: "",
			description: "",
			visibility: "private",
			settings: {
				allowInvites: true,
				defaultRole: "member",
				notificationsEnabled: true,
			},
		},
		validators: {
			onBlur: createTeamSchema,
		},
		onSubmit: async ({ value }) => {
			console.log(value);
			try {
				const values = createTeamSchema.parse(value);
				await createTeam({
					...values,
					ownerId: userId,
				});
				toast.success("Team created successfully!");
				setIsCreateTeamOpen(false);
			} catch (error) {
				toast.error("Failed to create team. Please try again.");
				console.error("Team creation error:", error);
			}
		},
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Your Teams</CardTitle>
					<CardDescription>
						Create and manage your teams. Teams help you collaborate with others
						on projects and resources.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{userTeams?.length === 0 ? (
							<p className="text-muted-foreground text-center py-8">
								You haven't created or joined any teams yet.
							</p>
						) : (
							<div className="grid gap-4">
								{userTeams?.map((team) => (
									<Card key={team._id}>
										<CardHeader>
											<CardTitle>{team.name}</CardTitle>
											{team.description && (
												<CardDescription>{team.description}</CardDescription>
											)}
										</CardHeader>
										<CardContent>
											<div className="flex items-center justify-between">
												<div className="space-y-1">
													<p className="text-sm font-medium">Visibility</p>
													<p className="text-sm text-muted-foreground">
														{team.visibility === "public"
															? "Public - Anyone can find this team"
															: "Private - Only members can access"}
													</p>
												</div>
												<Link to="/teams/$teamId" params={{ teamId: team._id }}>
													<Button variant="outline">Manage Team</Button>
												</Link>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
						<DialogTrigger asChild>
							<Button>Create New Team</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<form
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									form.handleSubmit();
								}}
							>
								<DialogHeader>
									<DialogTitle>Create New Team</DialogTitle>
									<DialogDescription>
										Create a new team to collaborate with others. You can invite
										team members after creating the team.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<form.AppField name="name">
										{(field) => (
											<field.TextField
												label="Team Name"
												placeholder="Enter team name"
											/>
										)}
									</form.AppField>

									<form.AppField name="description">
										{(field) => (
											<field.TextArea
												label="Description"
												placeholder="Describe your team's purpose"
											/>
										)}
									</form.AppField>

									<div className="space-y-4">
										<Label>Team Visibility</Label>
										<form.AppField name="visibility">
											{(field) => (
												<RadioGroup
													className="grid grid-cols-2 gap-4"
													defaultValue={field.state.value}
													onValueChange={(value) =>
														field.setValue(value as "public" | "private")
													}
												>
													<div>
														<RadioGroupItem
															value="private"
															id="visibility-private"
															className="peer sr-only"
														/>
														<Label
															htmlFor="visibility-private"
															className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
														>
															<span>Private</span>
														</Label>
													</div>
													<div>
														<RadioGroupItem
															value="public"
															id="visibility-public"
															className="peer sr-only"
														/>
														<Label
															htmlFor="visibility-public"
															className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
														>
															<span>Public</span>
														</Label>
													</div>
												</RadioGroup>
											)}
										</form.AppField>
									</div>

									<Separator />

									<div className="space-y-4">
										<Label>Team Settings</Label>
										<form.AppField name="settings.allowInvites">
											{(field) => (
												<div className="flex items-center justify-between">
													<div className="space-y-0.5">
														<Label>Allow Invites</Label>
														<p className="text-sm text-muted-foreground">
															Let team members invite others
														</p>
													</div>
													<Switch
														checked={field.state.value}
														onCheckedChange={field.setValue}
													/>
												</div>
											)}
										</form.AppField>

										<form.AppField name="settings.notificationsEnabled">
											{(field) => (
												<div className="flex items-center justify-between">
													<div className="space-y-0.5">
														<Label>Team Notifications</Label>
														<p className="text-sm text-muted-foreground">
															Receive notifications about team activity
														</p>
													</div>
													<Switch
														checked={field.state.value}
														onCheckedChange={field.setValue}
													/>
												</div>
											)}
										</form.AppField>

										<form.AppField name="settings.defaultRole">
											{(field) => (
												<div className="space-y-2">
													<Label>Default Member Role</Label>
													<RadioGroup
														className="grid grid-cols-2 gap-4"
														defaultValue={field.state.value}
														onValueChange={(value) =>
															field.setValue(value as "admin" | "member")
														}
													>
														<div>
															<RadioGroupItem
																value="member"
																id="role-member"
																className="peer sr-only"
															/>
															<Label
																htmlFor="role-member"
																className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
															>
																<span>Member</span>
															</Label>
														</div>
														<div>
															<RadioGroupItem
																value="admin"
																id="role-admin"
																className="peer sr-only"
															/>
															<Label
																htmlFor="role-admin"
																className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
															>
																<span>Admin</span>
															</Label>
														</div>
													</RadioGroup>
												</div>
											)}
										</form.AppField>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateTeamOpen(false)}
									>
										Cancel
									</Button>
									<form.AppForm>
										<form.SubscribeButton label="Create Team" />
									</form.AppForm>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</CardFooter>
			</Card>
		</div>
	);
}
