import { v } from "convex/values";
import { query } from "./_generated/server";
import { defineTable } from "convex/server";

export const projectTables = {

	products: defineTable({
		title: v.string(),
		imageId: v.string(),
		price: v.number(),
		createdBy: v.id("users"),
		teamId: v.optional(v.id("teams")),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_team", ["teamId"]),
}
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});
