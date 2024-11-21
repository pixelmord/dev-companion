import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
	...authTables,
	tasks: defineTable({
		text: v.string(),
		description: v.optional(v.string()),
		isCompleted: v.boolean(),
	}),
	designDocs: defineTable({
		name: v.string(),
		teamId: v.string(),
		createdBy: v.id("users"),
		archived: v.boolean(),
		document: v.string(),
		whiteboard: v.string(),
	}),
	teams: defineTable({
		name: v.string(),
		createdBy: v.id("users"),
		members: v.array(v.id("users")),
	}),
});
