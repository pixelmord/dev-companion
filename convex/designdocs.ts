import { defineTable } from "convex/server";

import { v } from "convex/values";

export const designDocsTables = {
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
}