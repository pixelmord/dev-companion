import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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
    createdAt: v.number(),
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

// Mutation to update a user's profile
export const updateUserProfile = mutation({
  args: updateUserProfileSchema,
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await UserModel.updateProfile(ctx, id, updates);
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