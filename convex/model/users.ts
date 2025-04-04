import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function getUserByClerkId(
  ctx: QueryCtx,
  clerkId: string
) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function getUser(
  ctx: QueryCtx,
  id: Id<"users">
) {
  return await ctx.db.get(id);
}

export async function createNewUser(
  ctx: MutationCtx,
  args: {
    clerkId: string;
    email: string;
    name: string;
    role: "admin" | "user" | "guest";
  }
) {
  const now = Date.now();

  // Check if user already exists
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
    .unique();

  if (existing) {
    throw new Error("User already exists");
  }

  return await ctx.db.insert("users", {
    ...args,
    lastActive: now,
    updatedAt: now,
    preferences: {
      theme: "system",
      notifications: true,
      emailDigest: false,
    },
  });
}

export async function updateProfile(
  ctx: MutationCtx,
  id: Id<"users">,
  updates: {
    name?: string;
    bio?: string;
    role?: "admin" | "user" | "guest";
    avatarUrl?: string;
    preferences?: {
      theme: "light" | "dark" | "system";
      notifications: boolean;
      emailDigest: boolean;
    };
  }
) {
  const user = await ctx.db.get(id);
  if (!user) throw new Error("User not found");

  await ctx.db.patch(id, {
    ...updates,
    updatedAt: Date.now(),
  });

  return id;
}

export async function updateLastActive(
  ctx: MutationCtx,
  id: Id<"users">
) {
  const user = await ctx.db.get(id);
  if (!user) throw new Error("User not found");

  await ctx.db.patch(id, {
    lastActive: Date.now(),
    updatedAt: Date.now(),
  });

  return id;
}