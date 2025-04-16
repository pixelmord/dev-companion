import { ConvexError } from "convex/values";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

export type TeamMember = {
  userId: Id<"users">;
  role: "owner" | "admin" | "member";
  joinedAt: number;
};

export type TeamInvite = {
  teamId: Id<"teams">;
  invitedBy: Id<"users">;
  invitedEmail: string;
  role: "admin" | "member";
  token: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
};



export async function getTeamsByMember(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<Doc<"teams">[]> {
  // Get all teams where the user is a member using the by_user index
  const memberships = await ctx.db
    .query("teamMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Fetch the actual team documents
  const teams = await Promise.all(
    memberships.map(membership => ctx.db.get(membership.teamId))
  );

  // Filter out any null teams and return
  return teams.filter((team): team is Doc<"teams"> => team !== null);
}

export async function getTeam(
  ctx: QueryCtx,
  id: Id<"teams">
): Promise<Doc<"teams">> {
  const team = await ctx.db.get(id);
  if (!team) {
    throw new ConvexError("Team not found");
  }
  return team;
}

export async function getTeamMembers(
  ctx: QueryCtx,
  teamId: Id<"teams">
): Promise<Doc<"teamMembers">[]> {
  return await ctx.db
    .query("teamMembers")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect();
}

export async function createNewTeam(
  ctx: MutationCtx,
  args: {
    name: string;
    description?: string;
    visibility: "public" | "private";
    ownerId: Id<"users">;
    settings?: {
      allowInvites: boolean;
      defaultRole: "admin" | "member";
      notificationsEnabled: boolean;
    };
  }
): Promise<Id<"teams">> {
  const defaultSettings = {
    allowInvites: true,
    defaultRole: "member" as const,
    notificationsEnabled: true,
  };

  const timestamp = Date.now();

  // Create the team with all fields matching the Team type
  const teamId = await ctx.db.insert("teams", {
    name: args.name,
    description: args.description,
    visibility: args.visibility,
    ownerId: args.ownerId,
    settings: args.settings ?? defaultSettings,
    createdBy: args.ownerId,
    createdAt: timestamp,
    updatedAt: timestamp,
  } as unknown as Doc<"teams">); // Cast to allow fields that match the actual schema

  // Add owner as a member
  await ctx.db.insert("teamMembers", {
    teamId,
    userId: args.ownerId,
    role: "owner",
    joinedAt: timestamp,
  });

  return teamId;
}

export async function updateTeam(
  ctx: MutationCtx,
  id: Id<"teams">,
  updates: {
    name?: string;
    description?: string;
    visibility?: "public" | "private";
    settings?: {
      allowInvites: boolean;
      defaultRole: "admin" | "member";
      notificationsEnabled: boolean;
    };
  }
) {
  const team = await ctx.db.get(id);
  if (!team) {
    throw new ConvexError("Team not found");
  }

  // Validate team name if provided
  if (updates.name && updates.name.trim().length < 3) {
    throw new ConvexError("Team name must be at least 3 characters long");
  }

  // Include updatedAt in the patch
  await ctx.db.patch(id, {
    ...updates,
    updatedAt: Date.now(),
  } as unknown as Partial<Doc<"teams">>); // Cast to allow fields that match the actual schema

  return id;
}

export async function addTeamMember(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  userId: Id<"users">,
  role: "admin" | "member"
): Promise<Id<"teamMembers">> {
  const team = await ctx.db.get(teamId);
  if (!team) {
    throw new ConvexError("Team not found");
  }

  // Check if user is already a member
  const existingMember = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (q) =>
      q.eq("teamId", teamId).eq("userId", userId)
    )
    .unique();

  if (existingMember) {
    throw new ConvexError("User is already a member of this team");
  }

  // Add the member
  const memberId = await ctx.db.insert("teamMembers", {
    teamId,
    userId,
    role,
    joinedAt: Date.now(),
  });

  return memberId;
}

export async function updateTeamMemberRole(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  userId: Id<"users">,
  newRole: "admin" | "member"
): Promise<Id<"teamMembers">> {
  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (q) =>
      q.eq("teamId", teamId).eq("userId", userId)
    )
    .unique();

  if (!member) {
    throw new ConvexError("User is not a member of this team");
  }

  if (member.role === "owner") {
    throw new ConvexError("Cannot change role of team owner");
  }

  await ctx.db.patch(member._id, { role: newRole });
  return member._id;
}

export async function removeTeamMember(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  userId: Id<"users">
): Promise<void> {
  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (q) =>
      q.eq("teamId", teamId).eq("userId", userId)
    )
    .unique();

  if (!member) {
    throw new ConvexError("User is not a member of this team");
  }

  if (member.role === "owner") {
    throw new ConvexError("Cannot remove team owner");
  }

  await ctx.db.delete(member._id);
}

export async function ensureTeamAccess(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  userId: Id<"users">,
  requiredRole: "owner" | "admin" | "member" = "member"
): Promise<void> {
  const team = await ctx.db.get(teamId);
  if (!team) {
    throw new ConvexError("Team not found");
  }

  // Check if user is owner
  if (team.ownerId === userId) {
    return;
  }

  // Check team membership
  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (q) =>
      q.eq("teamId", teamId).eq("userId", userId)
    )
    .unique();

  if (!member) {
    throw new ConvexError("User is not a member of this team");
  }

  // Check role requirements
  if (requiredRole === "owner") {
    throw new ConvexError("Only team owner can perform this action");
  }
  if (requiredRole === "admin" && member.role !== "admin") {
    throw new ConvexError("Admin access required");
  }
}

export async function createTeamInvite(
  ctx: MutationCtx,
  args: {
    teamId: Id<"teams">;
    invitedBy: Id<"users">;
    invitedEmail: string;
    role: "admin" | "member";
  }
): Promise<Id<"teamInvites">> {
  const team = await ctx.db.get(args.teamId);
  if (!team) {
    throw new ConvexError("Team not found");
  }

  if (!team.settings || !team.settings.allowInvites) {
    throw new ConvexError("Team invites are disabled");
  }

  // Check for existing pending invite
  const existingInvite = await ctx.db
    .query("teamInvites")
    .withIndex("by_team_and_email", (q) =>
      q.eq("teamId", args.teamId).eq("invitedEmail", args.invitedEmail)
    )
    .filter((q) => q.eq(q.field("status"), "pending"))
    .unique();

  if (existingInvite) {
    throw new ConvexError("Invite already exists for this email");
  }

  // Create the invite with all fields that match the actual TeamInvite schema
  return await ctx.db.insert("teamInvites", {
    teamId: args.teamId,
    invitedBy: args.invitedBy,
    invitedEmail: args.invitedEmail,
    role: args.role,
    token: generateInviteToken(),
    status: "pending",
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function acceptTeamInvite(
  ctx: MutationCtx,
  token: string,
  userId: Id<"users">
): Promise<Doc<"teams">> {
  const invite = await ctx.db
    .query("teamInvites")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!invite) {
    throw new ConvexError("Invalid invite token");
  }

  if (invite.status !== "pending") {
    throw new ConvexError("Invite is no longer valid");
  }

  if (invite.expiresAt < Date.now()) {
    await ctx.db.patch(invite._id, { status: "expired" });
    throw new ConvexError("Invite has expired");
  }

  // Add user to team
  await addTeamMember(ctx, invite.teamId, userId, invite.role);

  // Update invite status
  await ctx.db.patch(invite._id, {
    status: "accepted",
    updatedAt: Date.now(),
  });

  const team = await ctx.db.get(invite.teamId);
  if (!team) {
    throw new ConvexError("Team not found");
  }
  return team;
}

export async function declineTeamInvite(
  ctx: MutationCtx,
  token: string
): Promise<Id<"teamInvites">> {
  const invite = await ctx.db
    .query("teamInvites")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!invite) {
    throw new ConvexError("Invalid invite token");
  }

  if (invite.status !== "pending") {
    throw new ConvexError("Invite is no longer valid");
  }

  // Update invite status
  await ctx.db.patch(invite._id, {
    status: "declined",
    updatedAt: Date.now(),
  });

  return invite._id;
}

// Helper function to generate a random invite token
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}