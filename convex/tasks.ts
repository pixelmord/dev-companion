import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import * as TaskModel from "./model/tasks";
import { defineTable } from "convex/server";

export const tasksTables = {
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
}
export const getTasks = query({
	args: {
		teamId: v.optional(v.id("teams")),
		assignedTo: v.optional(v.id("users")),
	},
	returns: v.array(v.object({
		_id: v.id("tasks"),
		_creationTime: v.number(),
		text: v.string(),
		description: v.optional(v.string()),
		isCompleted: v.boolean(),
		teamId: v.optional(v.id("teams")),
		assignedTo: v.optional(v.id("users")),
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	})),
	handler: async (ctx, args) => {
		if (args.teamId) {
			return await TaskModel.getTasksByTeam(ctx, args.teamId);
		} else if (args.assignedTo) {
			return await TaskModel.getTasksByAssignee(ctx, args.assignedTo);
		}
		return await ctx.db.query("tasks").collect();
	},
});

export const createTask = mutation({
	args: {
		text: v.string(),
		description: v.optional(v.string()),
		teamId: v.optional(v.id("teams")),
		assignedTo: v.optional(v.id("users")),
	},
	returns: v.id("tasks"),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}
		if (process.env.NODE_ENV !== "production") {
			console.warn("User identity retrieved:", { subject: identity.subject });
	}
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		return await TaskModel.createTask(ctx, {
			...args,
			createdBy: user._id,
		});
	},
});

export const updateTask = mutation({
	args: {
		id: v.id("tasks"),
		isCompleted: v.boolean(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}
		console.log(identity);

		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Ensure user has access to the task
		await TaskModel.ensureTaskAccess(ctx, args.id, user._id);

		// Update the task status
		await TaskModel.updateTaskStatus(ctx, args.id, args.isCompleted);
		return null;
	},
});
