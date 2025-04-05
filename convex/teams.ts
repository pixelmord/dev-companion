import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as TeamModel from "./model/teams";

export const teamsTables = {
	teams: defineTable({
		// Basic info
		name: v.string(),
		description: v.optional(v.string()),
		visibility: v.union(v.literal("public"), v.literal("private")),
		avatar: v.optional(v.string()),

		// Ownership and access
		ownerId: v.id("users"),
		members: v.array(
			v.object({
				userId: v.id("users"),
				role: v.union(
					v.literal("owner"),
					v.literal("admin"),
					v.literal("member")
				),
				joinedAt: v.number(),
			})
		),

		// Team settings
		settings: v.object({
			allowInvites: v.boolean(),
			defaultRole: v.union(
				v.literal("admin"),
				v.literal("member")
			),
			notificationsEnabled: v.boolean(),
		}),

		// Audit fields
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_owner", ["ownerId"])
		.index("by_visibility", ["visibility"])
		.index("by_member", ["members"]),

	teamInvites: defineTable({
		teamId: v.id("teams"),
		invitedBy: v.id("users"),
		invitedEmail: v.string(),
		role: v.union(
			v.literal("admin"),
			v.literal("member")
		),
		token: v.string(),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("declined"),
			v.literal("expired")
		),
		expiresAt: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_team", ["teamId"])
		.index("by_email", ["invitedEmail"])
		.index("by_token", ["token"])
		.index("by_status", ["status"]),
};

const teamValidator = teamsTables.teams.validator;
const teamInviteValidator = teamsTables.teamInvites.validator;

// Validator for creating a team
export const createTeamSchema = v.object({
	name: v.string(),
	description: v.optional(v.string()),
	visibility: v.union(v.literal("public"), v.literal("private")),
	ownerId: v.id("users"),
});

// Validator for updating a team
export const updateTeamSchema = v.object({
	id: v.id("teams"),
	name: v.optional(v.string()),
	description: v.optional(v.string()),
	visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
	settings: v.optional(v.object({
		allowInvites: v.boolean(),
		defaultRole: v.union(v.literal("admin"), v.literal("member")),
		notificationsEnabled: v.boolean(),
	})),
});

// Query to get all teams a user is a member of
export const getUserTeams = query({
	args: { userId: v.id("users") },
	returns: v.array(v.object({
		_id: v.id("teams"),
		_creationTime: v.number(),
		name: v.string(),
		description: v.optional(v.string()),
		visibility: v.union(v.literal("public"), v.literal("private")),
		ownerId: v.id("users"),
		settings: v.object({
			allowInvites: v.boolean(),
			defaultRole: v.union(v.literal("admin"), v.literal("member")),
			notificationsEnabled: v.boolean(),
		}),
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	})),
	handler: async (ctx, args) => {
		return await TeamModel.getTeamsByMember(ctx, args.userId);
	},
});

// Query to get a specific team
export const getTeam = query({
	args: { id: v.id("teams") },
	returns: v.union(
		v.object({
			_id: v.id("teams"),
			_creationTime: v.number(),
			name: v.string(),
			description: v.optional(v.string()),
			visibility: v.union(v.literal("public"), v.literal("private")),
			ownerId: v.id("users"),
			settings: v.object({
				allowInvites: v.boolean(),
				defaultRole: v.union(v.literal("admin"), v.literal("member")),
				notificationsEnabled: v.boolean(),
			}),
			createdBy: v.id("users"),
			createdAt: v.number(),
			updatedAt: v.number(),
		}),
		v.null()
	),
	handler: async (ctx, args) => {
		return await TeamModel.getTeam(ctx, args.id);
	},
});

// Query to get team invites by email
export const getTeamInvitesByEmail = query({
	args: { email: v.string() },
	returns: v.array(teamInviteValidator),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("teamInvites")
			.withIndex("by_email", (q) => q.eq("invitedEmail", args.email))
			.filter((q) => q.eq(q.field("status"), "pending"))
			.collect();
	},
});

// Query to get team invites
export const getTeamInvites = query({
	args: {
		teamId: v.id("teams"),
	},
	returns: v.array(v.object({
		_id: v.id("teamInvites"),
		_creationTime: v.number(),
		teamId: v.id("teams"),
		invitedBy: v.id("users"),
		invitedEmail: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
		token: v.string(),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("declined"),
			v.literal("expired")
		),
		expiresAt: v.number(),
		updatedAt: v.number(),
	})),
	handler: async (ctx, { teamId }) => {
		// Get pending invites for the team
		const invites = await ctx.db
			.query("teamInvites")
			.withIndex("by_team_and_status", (q) =>
				q.eq("teamId", teamId).eq("status", "pending")
			)
			.collect();

		return invites;
	},
});

export const getInvitesByEmail = query({
	args: {
		email: v.string(),
	},
	returns: v.array(v.object({
		_id: v.id("teamInvites"),
		_creationTime: v.number(),
		teamId: v.id("teams"),
		invitedBy: v.id("users"),
		invitedEmail: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
		token: v.string(),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("declined"),
			v.literal("expired")
		),
		expiresAt: v.number(),
		updatedAt: v.number(),
	})),
	handler: async (ctx, { email }) => {
		// Get pending invites for the email
		const invites = await ctx.db
			.query("teamInvites")
			.withIndex("by_email", (q) => q.eq("invitedEmail", email))
			.filter((q) => q.eq(q.field("status"), "pending"))
			.collect();

		return invites;
	},
});

// Mutation to create a new team
export const createTeam = mutation({
	args: createTeamSchema,
	returns: v.id("teams"),
	handler: async (ctx, args) => {
		return await TeamModel.createNewTeam(ctx, args);
	},
});

// Mutation to update a team
export const updateTeam = mutation({
	args: updateTeamSchema,
	returns: v.id("teams"),
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await TeamModel.updateTeam(ctx, id, updates);
	},
});

// Mutation to add a team member
export const addTeamMember = mutation({
	args: {
		teamId: v.id("teams"),
		userId: v.id("users"),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	returns: v.id("teamMembers"),
	handler: async (ctx, args) => {
		return await TeamModel.addTeamMember(ctx, args.teamId, args.userId, args.role);
	},
});

// Mutation to update a team member's role
export const updateTeamMemberRole = mutation({
	args: {
		teamId: v.id("teams"),
		userId: v.id("users"),
		newRole: v.union(v.literal("admin"), v.literal("member")),
	},
	returns: v.id("teamMembers"),
	handler: async (ctx, args) => {
		return await TeamModel.updateTeamMemberRole(ctx, args.teamId, args.userId, args.newRole);
	},
});

// Mutation to remove a team member
export const removeTeamMember = mutation({
	args: {
		teamId: v.id("teams"),
		userId: v.id("users"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await TeamModel.removeTeamMember(ctx, args.teamId, args.userId);
		return null;
	},
});

// Mutation to create a new invite
export const createInvite = mutation({
	args: {
		teamId: v.id("teams"),
		invitedEmail: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	returns: v.id("teamInvites"),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}

		// Get the user's ID from their identity
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Ensure user has admin access to the team
		await TeamModel.ensureTeamAccess(ctx, args.teamId, user._id, "admin");

		// Create the invite
		return await TeamModel.createTeamInvite(ctx, {
			teamId: args.teamId,
			invitedBy: user._id,
			invitedEmail: args.invitedEmail,
			role: args.role,
		});
	},
});

export const acceptInvite = mutation({
	args: {
		token: v.string(),
	},
	returns: v.object({
		_id: v.id("teams"),
		_creationTime: v.number(),
		name: v.string(),
		description: v.optional(v.string()),
		visibility: v.union(v.literal("public"), v.literal("private")),
		ownerId: v.id("users"),
		settings: v.object({
			allowInvites: v.boolean(),
			defaultRole: v.union(v.literal("admin"), v.literal("member")),
			notificationsEnabled: v.boolean(),
		}),
		createdBy: v.id("users"),
		updatedAt: v.number(),
	}),
	handler: async (ctx, { token }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}

		// Get the user's ID from their identity
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Accept the invite
		return await TeamModel.acceptTeamInvite(ctx, token, user._id);
	},
});

export const declineInvite = mutation({
	args: {
		token: v.string(),
	},
	returns: v.id("teamInvites"),
	handler: async (ctx, { token }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}

		// Decline the invite
		return await TeamModel.declineTeamInvite(ctx, token);
	},
});
