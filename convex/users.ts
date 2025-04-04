import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as UserModel from "./model/users";

export const usersTables = {
  users: defineTable({
    // System fields from Clerk
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),

    // Profile fields
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("user"),
      v.literal("guest")
    ),

    // Preferences
    preferences: v.optional(v.object({
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      notifications: v.boolean(),
      emailDigest: v.boolean(),
    })),

    // Timestamps
    lastActive: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_email", ["email"]),
};

const userValidator = usersTables.users.validator;

// Validator for updating user profile
export const updateUserProfileSchema = v.object({
  id: v.id("users"),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
  role: v.optional(v.union(
    v.literal("admin"),
    v.literal("user"),
    v.literal("guest")
  )),
  avatarUrl: v.optional(v.string()),
  preferences: v.optional(v.object({
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    notifications: v.boolean(),
    emailDigest: v.boolean(),
  })),
});

// Query to get a user's profile by Clerk ID
export const getProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

// Mutation to create a new user profile
export const createProfile = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
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
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
      role: "user",
      preferences: {
        theme: "system",
        notifications: true,
        emailDigest: true,
      },
      lastActive: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Mutation to update a user's profile
export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
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
    return await UserModel.getUserByClerkId(ctx, args.clerkId);
  },
});

// Query to get a user by their ID
export const getUser = query({
  args: { id: v.id("users") },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    return await UserModel.getUser(ctx, args.id);
  },
});

// Mutation to create a new user
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("user"),
      v.literal("guest")
    ),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await UserModel.createNewUser(ctx, args);
  },
});

// Mutation to update user's last active timestamp
export const updateUserLastActive = mutation({
  args: { id: v.id("users") },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await UserModel.updateLastActive(ctx, args.id);
  },
});