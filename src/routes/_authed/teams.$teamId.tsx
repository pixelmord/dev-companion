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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppForm } from "@/features/form/form";
import { api } from "@convex-server/_generated/api";
import type { Id } from "@convex-server/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authed/teams/$teamId")({
	component: TeamDetailsComponent,
});

const inviteSchema = z.object({
	invitedEmail: z.string().email("Invalid email address"),
	role: z.enum(["admin", "member"]),
});

function TeamDetailsComponent() {
	const { teamId } = Route.useParams();
	const team = useQuery(api.teams.getTeam, { id: teamId as Id<"teams"> });
	const members = useQuery(api.teams.getTeamMembers, {
		teamId: teamId as Id<"teams">,
	});
	const createInvite = useMutation(api.teams.createInvite);
	const removeMember = useMutation(api.teams.removeTeamMember);
	const updateRole = useMutation(api.teams.updateTeamMemberRole);
	const [memberToRemove, setMemberToRemove] = useState<{
		userId: Id<"users">;
		name: string;
	} | null>(null);

	const form = useAppForm({
		defaultValues: {
			invitedEmail: "",
			role: "member",
		},
		onSubmit: async ({ value }) => {
			const validationResult = inviteSchema.safeParse(value);
			if (!validationResult.success) {
				toast.error("Please fix the errors in the form.");
				console.error("Form validation failed:", validationResult.error);
				return;
			}

			try {
				await createInvite({
					teamId: teamId as Id<"teams">,
					invitedEmail: validationResult.data.invitedEmail,
					role: validationResult.data.role,
				});
				toast.success(
					`Invitation sent to ${validationResult.data.invitedEmail}`,
				);
				form.reset();
				// TODO: Optionally refetch invites list or team data
			} catch (error) {
				console.error("Failed to send invite:", error);
				toast.error("Failed to send invitation. Please try again.");
			}
		},
	});

	return (
		<div className="container mx-auto p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>
						Manage Team:{" "}
						{team?.name ?? <Loader2 className="inline h-5 w-5 animate-spin" />}
					</CardTitle>
					{team?.description && (
						<CardDescription>{team.description}</CardDescription>
					)}
				</CardHeader>
				{/* Add team settings section here if needed */}
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>
						View and manage team members and their roles.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{members === undefined && (
						<div className="flex justify-center items-center h-24">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					)}
					{members && members.length === 0 && (
						<p className="text-muted-foreground text-center py-4">
							No members found in this team.
						</p>
					)}
					{members && members.length > 0 && (
						<ul className="space-y-4">
							{members.map((member) => (
								<li
									key={member.userId}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="flex items-center gap-4">
										<Avatar>
											<AvatarImage
												src={member.avatarUrl ?? undefined}
												alt={member.name}
											/>
											<AvatarFallback>
												{member.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{member.name}</p>
											<p className="text-sm text-muted-foreground">
												{member.email}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{/* Role Selection Dropdown */}
										<Select
											value={member.role}
											onValueChange={async (newRole) => {
												try {
													await updateRole({
														teamId: teamId as Id<"teams">,
														userId: member.userId,
														newRole: newRole as "admin" | "member",
													});
													toast.success(
														`${member.name}'s role updated to ${newRole}`,
													);
													// TODO: Invalidate members query for optimistic update
												} catch (error) {
													console.error("Failed to update role:", error);
													toast.error("Failed to update member role.");
												}
											}}
											// TODO: Add role-based access control (disable for non-admins)
										>
											<SelectTrigger className="w-[100px] capitalize">
												<SelectValue placeholder="Role" />
											</SelectTrigger>
											<SelectContent>
												{/* Exclude 'owner' as it shouldn't be settable */}
												<SelectItem value="admin" className="capitalize">
													Admin
												</SelectItem>
												<SelectItem value="member" className="capitalize">
													Member
												</SelectItem>
											</SelectContent>
										</Select>

										{/* Remove Member Button with Dialog */}
										<AlertDialog
											open={memberToRemove?.userId === member.userId}
											onOpenChange={(isOpen) => {
												if (!isOpen) {
													setMemberToRemove(null);
												}
											}}
										>
											<AlertDialogTrigger asChild>
												<Button
													variant="destructive"
													size="sm"
													onClick={() =>
														setMemberToRemove({
															userId: member.userId,
															name: member.name,
														})
													}
												>
													Remove
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Are you sure?</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone. This will permanently
														remove <strong>{memberToRemove?.name}</strong> from
														the team.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel
														onClick={() => setMemberToRemove(null)}
													>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={async () => {
															if (!memberToRemove) return;
															try {
																await removeMember({
																	teamId: teamId as Id<"teams">,
																	userId: memberToRemove.userId,
																});
																toast.success(
																	`Removed ${memberToRemove.name} from the team.`,
																);
																setMemberToRemove(null);
																// TODO: Refetch members list using queryClient.invalidateQueries
															} catch (error) {
																console.error(
																	"Failed to remove member:",
																	error,
																);
																toast.error("Failed to remove member.");
																setMemberToRemove(null);
															}
														}}
													>
														Remove Member
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</li>
							))}
						</ul>
					)}
					<Separator className="my-6" />
					<div>
						<h3 className="text-lg font-medium mb-4">Invite New Member</h3>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4 max-w-md"
						>
							<form.AppField
								name="invitedEmail"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "Email is required";
										if (!z.string().email().safeParse(value).success) {
											return "Invalid email address";
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<field.TextField
										label="Email Address"
										placeholder="Enter email to invite"
										type="email"
									/>
								)}
							</form.AppField>

							<form.AppField name="role">
								{/* Use raw component to bypass potential type issues with field component */}
								{() => (
									<div className="space-y-2">
										<Label>Role</Label>
										<RadioGroup
											className="grid grid-cols-2 gap-4"
											value={form.state.values.role}
											onValueChange={(value) =>
												form.setFieldValue("role", value as "admin" | "member")
											}
										>
											<div>
												<RadioGroupItem
													value="member"
													id="invite-role-member"
													className="peer sr-only"
												/>
												<Label
													htmlFor="invite-role-member"
													className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
												>
													<span>Member</span>
												</Label>
											</div>
											<div>
												<RadioGroupItem
													value="admin"
													id="invite-role-admin"
													className="peer sr-only"
												/>
												<Label
													htmlFor="invite-role-admin"
													className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
												>
													<span>Admin</span>
												</Label>
											</div>
										</RadioGroup>
									</div>
								)}
							</form.AppField>
							<form.AppForm>
								<form.SubscribeButton label="Send Invitation" />
							</form.AppForm>
						</form>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
