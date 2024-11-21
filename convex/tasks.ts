import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTasks = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("tasks").collect();
	},
});

export const createTask = mutation({
	args: {
		text: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("tasks", {
			text: args.text,
			description: args.description,
			isCompleted: false,
		});
	},
});

export const updateTask = mutation({
	args: {
		id: v.id("tasks"),
		isCompleted: v.boolean(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			isCompleted: args.isCompleted,
		});
	},
});
