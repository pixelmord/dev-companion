import { v } from "convex/values";
import { action, mutation } from "./_generated/server";

// Generate a signed URL for uploading a file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store the file ID in the user's profile
export const updateUserAvatar = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get the file URL
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get file URL");
    }

    // Update the user's profile with the new avatar URL
    await ctx.db.patch(args.userId, {
      avatarUrl: url,
      updatedAt: Date.now(),
    });

    return url;
  },
});

// Get a file's URL by its storage ID
export const getFileUrl = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});