import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { boardTables } from "./board";
import { teamsTables } from "./teams";
import { usersTables } from "./users";
import { projectsTables } from "./projects";
import { resourcesTables } from "./resources";
import { activityTables } from "./activities";

const schema = defineSchema({
	// User and team management
	...usersTables,
	...teamsTables,
	...projectsTables,
	...resourcesTables,
	...activityTables,

	// Core functionality
	tasks: defineTable({
		text: v.string(),
		description: v.optional(v.string()),
		isCompleted: v.boolean(),
		teamId: v.optional(v.id("teams")),
		assignedTo: v.optional(v.id("users")),
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_team", ["teamId"])
		.index("by_assigned", ["assignedTo"])
		.index("by_created", ["createdBy"])
		.index("by_team_and_assigned", ["teamId", "assignedTo"]),

	designDocs: defineTable({
		name: v.string(),
		teamId: v.id("teams"),
		createdBy: v.id("users"),
		archived: v.boolean(),
		document: v.string(),
		whiteboard: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_team", ["teamId"]),

	products: defineTable({
		title: v.string(),
		imageId: v.string(),
		price: v.number(),
		createdBy: v.id("users"),
		teamId: v.optional(v.id("teams")),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_team", ["teamId"]),

	// Board functionality
	...boardTables,

	teams: defineTable({
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
	}).index("by_owner", ["ownerId"]),

	teamMembers: defineTable({
		teamId: v.id("teams"),
		userId: v.id("users"),
		role: v.union(
			v.literal("owner"),
			v.literal("admin"),
			v.literal("member")
		),
		joinedAt: v.number(),
	}).index("by_team", ["teamId"])
		.index("by_user", ["userId"])
		.index("by_team_and_user", ["teamId", "userId"]),

	teamInvites: defineTable({
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
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_token", ["token"])
		.index("by_email", ["invitedEmail"])
		.index("by_team", ["teamId"])
		.index("by_status", ["status"])
		.index("by_team_and_status", ["teamId", "status"])
		.index("by_team_and_email", ["teamId", "invitedEmail"]),
});

export default schema;
