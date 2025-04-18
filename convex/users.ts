import { zCustomMutation, zCustomQuery, zid } from "convex-helpers/server/zod";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";

import { NoOp } from "convex-helpers/server/customFunctions";
import { mutation, query } from "./_generated/server";
const zodQuery = zCustomQuery(query, NoOp);
const zodMutation = zCustomMutation(mutation, NoOp);
export const usersTables = {
	users: defineTable({
		// System fields from Clerk
		clerkId: v.string(),
		email: v.string(),
		name: v.string(),

		// Profile fields
		avatarUrl: v.optional(v.string()),
		bio: v.optional(v.string()),
		role: v.union(v.literal("admin"), v.literal("user"), v.literal("guest")),
		connections: v.optional(v.array(v.id("users"))),
		// Social media links
		// format array of objects that have a type and url
		social: v.optional(
			v.array(
				v.object({
					type: v.union(
						v.literal("github"),
						v.literal("bluesky"),
						v.literal("website"),
					),
					url: v.string(),
				}),
			),
		),

		// Preferences
		preferences: v.optional(
			v.object({
				theme: v.union(
					v.literal("light"),
					v.literal("dark"),
					v.literal("system"),
				),
				notifications: v.boolean(),
				emailDigest: v.boolean(),
			}),
		),

		// Timestamps
		lastActive: v.number(),
		updatedAt: v.number(),
	})
		.index("by_clerk_id", ["clerkId"])
		.index("by_role", ["role"])
		.index("by_email", ["email"]),
};

const userValidator = usersTables.users.validator;

// Query to get a user's profile by Clerk ID
export const getProfile = zodQuery({
	args: { clerkId: z.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		return user;
	},
});

export const createUserProfileSchema = z.object({
	clerkId: z.string(),
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address"),
	bio: z.string().optional(),
	avatarUrl: z.string().optional(),
	role: z.enum(["admin", "user", "guest"]),
	connections: z.array(zid("users")),
	preferences: z.object({
		theme: z.enum(["light", "dark", "system"]),
		notifications: z.boolean(),
		emailDigest: z.boolean(),
	}),
});

// Mutation to create a new user profile
export const createProfile = zodMutation({
	args: createUserProfileSchema,
	handler: async (ctx, args) => {
		// Check if profile already exists
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (existingUser) {
			throw new Error("Profile already exists");
		}

		// Create new profile
		const userId = await ctx.db.insert("users", {
			...args,
			lastActive: Date.now(),
			updatedAt: Date.now(),
		});

		return userId;
	},
});

// Validator for updating user profile
export const updateUserProfileSchema = z.object({
	id: zid("users"),
	name: z.string().optional(),
	email: z.string().email().optional(),
	bio: z.string().optional(),
	avatarUrl: z.string().optional(),
	connections: z.array(zid("users")).optional(),
	role: z.enum(["admin", "user", "guest"]).optional(),
	preferences: z
		.object({
			theme: z.enum(["light", "dark", "system"]),
			notifications: z.boolean(),
			emailDigest: z.boolean(),
		})
		.optional(),
});

// Mutation to update a user's profile
export const updateProfile = zodMutation({
	args: updateUserProfileSchema,
	handler: async (ctx, args) => {
		const { id, ...updates } = args;

		// Check if profile exists
		const existingUser = await ctx.db.get(id);
		if (!existingUser) {
			throw new Error("Profile not found");
		}

		// Update profile
		await ctx.db.patch(id, {
			...updates,
			lastActive: Date.now(),
			updatedAt: Date.now(),
		});

		return true;
	},
});

// Query to get a user by their Clerk ID
export const getUserByClerkId = query({
	args: { clerkId: v.string() },
	returns: v.union(userValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();
	},
});

// Query to get a user by their ID
export const getUser = query({
	args: { id: v.id("users") },
	returns: v.union(userValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});
export const getCurrentUser = query({
	returns: v.union(userValidator, v.null()),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		return user;
	},
});

// Mutation to update user's last active timestamp
export const updateUserLastActive = mutation({
	args: { id: v.id("users") },
	returns: v.id("users"),
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id);
		if (!user) throw new Error("User not found");

		await ctx.db.patch(args.id, {
			lastActive: Date.now(),
			updatedAt: Date.now(),
		});

		return args.id;
	},
});
