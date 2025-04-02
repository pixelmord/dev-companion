import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as ResourceModel from "./model/resources";

export const resourcesTables = {
  resources: defineTable({
    // Basic info
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("document"),
      v.literal("codeSnippet"),
      v.literal("externalLink"),
      v.literal("feed")
    ),

    // Project association
    projectId: v.id("projects"),

    // Resource visibility
    visibility: v.union(
      v.literal("public"),
      v.literal("team"),
      v.literal("private")
    ),

    // Type-specific fields
    content: v.union(
      // Document
      v.object({
        type: v.literal("document"),
        content: v.string(),
        format: v.string(),
        version: v.number(),
      }),
      // Code Snippet
      v.object({
        type: v.literal("codeSnippet"),
        code: v.string(),
        language: v.string(),
        highlightOptions: v.optional(v.object({
          theme: v.string(),
          lineNumbers: v.boolean(),
        })),
      }),
      // External Link
      v.object({
        type: v.literal("externalLink"),
        url: v.string(),
        favicon: v.optional(v.string()),
        lastChecked: v.number(),
      }),
      // Feed
      v.object({
        type: v.literal("feed"),
        source: v.string(),
        refreshFrequency: v.number(), // in minutes
        lastUpdated: v.number(),
      })
    ),

    // Tags
    tags: v.array(v.string()),

    // Access tracking
    lastAccessedAt: v.optional(v.number()),
    accessCount: v.number(),

    // Audit fields
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_type", ["type"])
    .index("by_project_and_type", ["projectId", "type"])
    .index("by_tag", ["tags"])
    .index("by_project_and_tag", ["projectId", "tags"])
    .searchIndex("search", {
      searchField: "name",
      filterFields: ["projectId", "type", "tags"],
    }),

  resourceFavorites: defineTable({
    resourceId: v.id("resources"),
    userId: v.id("users"),
    createdAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_resource", ["resourceId"])
    .index("by_user_and_resource", ["userId", "resourceId"]),

  resourceAccess: defineTable({
    resourceId: v.id("resources"),
    userId: v.id("users"),
    accessedAt: v.number(),
    accessType: v.union(
      v.literal("view"),
      v.literal("edit"),
      v.literal("share"),
      v.literal("download")
    ),
  })
    .index("by_resource", ["resourceId"])
    .index("by_user", ["userId"])
    .index("by_recent", ["accessedAt"]),
};

const resourceValidator = resourcesTables.resources.validator;

// Validator for creating a resource
export const createResourceSchema = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal("document"),
    v.literal("codeSnippet"),
    v.literal("externalLink"),
    v.literal("feed")
  ),
  projectId: v.id("projects"),
  visibility: v.union(
    v.literal("public"),
    v.literal("team"),
    v.literal("private")
  ),
  content: v.union(
    // Document
    v.object({
      type: v.literal("document"),
      content: v.string(),
      format: v.string(),
      version: v.number(),
    }),
    // Code Snippet
    v.object({
      type: v.literal("codeSnippet"),
      code: v.string(),
      language: v.string(),
      highlightOptions: v.optional(v.object({
        theme: v.string(),
        lineNumbers: v.boolean(),
      })),
    }),
    // External Link
    v.object({
      type: v.literal("externalLink"),
      url: v.string(),
      favicon: v.optional(v.string()),
      lastChecked: v.number(),
    }),
    // Feed
    v.object({
      type: v.literal("feed"),
      source: v.string(),
      refreshFrequency: v.number(),
      lastUpdated: v.number(),
    })
  ),
});

// Query to get all resources for a project
export const getProjectResources = query({
  args: { projectId: v.id("projects") },
  returns: v.array(resourceValidator),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourcesByProject(ctx, args.projectId);
  },
});

// Query to get a specific resource
export const getResource = query({
  args: { id: v.id("resources") },
  returns: v.union(resourceValidator, v.null()),
  handler: async (ctx, args) => {
    return await ResourceModel.getResource(ctx, args.id);
  },
});

// Query to get resources by type
export const getResourcesByType = query({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("document"),
      v.literal("codeSnippet"),
      v.literal("externalLink"),
      v.literal("feed")
    ),
  },
  returns: v.array(resourceValidator),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourcesByType(ctx, args.projectId, args.type);
  },
});

// Query to search resources
export const searchResources = query({
  args: {
    searchTerm: v.string(),
    projectId: v.optional(v.id("projects")),
    type: v.optional(v.union(
      v.literal("document"),
      v.literal("codeSnippet"),
      v.literal("externalLink"),
      v.literal("feed")
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(resourceValidator),
  handler: async (ctx, args) => {
    return await ResourceModel.searchResources(ctx, args);
  },
});

// Mutation to create a new resource
export const createResource = mutation({
  args: createResourceSchema,
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    return await ResourceModel.createResource(ctx, args);
  },
});

// Mutation to update a resource
export const updateResource = mutation({
  args: v.object({
    id: v.id("resources"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(
      v.literal("public"),
      v.literal("team"),
      v.literal("private")
    )),
    content: v.optional(v.union(
      // Document
      v.object({
        type: v.literal("document"),
        content: v.string(),
        format: v.string(),
        version: v.number(),
      }),
      // Code Snippet
      v.object({
        type: v.literal("codeSnippet"),
        code: v.string(),
        language: v.string(),
        highlightOptions: v.optional(v.object({
          theme: v.string(),
          lineNumbers: v.boolean(),
        })),
      }),
      // External Link
      v.object({
        type: v.literal("externalLink"),
        url: v.string(),
        favicon: v.optional(v.string()),
        lastChecked: v.number(),
      }),
      // Feed
      v.object({
        type: v.literal("feed"),
        source: v.string(),
        refreshFrequency: v.number(),
        lastUpdated: v.number(),
      })
    )),
  }),
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ResourceModel.updateResource(ctx, id, updates);
  },
});

// Mutation to share a resource
export const shareResource = mutation({
  args: {
    resourceId: v.id("resources"),
    visibility: v.union(
      v.literal("public"),
      v.literal("team"),
      v.literal("private")
    ),
  },
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    return await ResourceModel.shareResource(ctx, args.resourceId, args.visibility);
  },
});

// Mutation to add tags to a resource
export const addTags = mutation({
  args: {
    resourceId: v.id("resources"),
    tags: v.array(v.string()),
  },
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    return await ResourceModel.addTags(ctx, args.resourceId, args.tags);
  },
});

// Mutation to remove tags from a resource
export const removeTags = mutation({
  args: {
    resourceId: v.id("resources"),
    tags: v.array(v.string()),
  },
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    return await ResourceModel.removeTags(ctx, args.resourceId, args.tags);
  },
});

// Query to get resources by tag
export const getResourcesByTag = query({
  args: {
    tag: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.array(resourceValidator),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourcesByTag(ctx, args.tag, args.projectId);
  },
});

// Mutation to add a resource to favorites
export const addToFavorites = mutation({
  args: {
    resourceId: v.id("resources"),
    notes: v.optional(v.string()),
  },
  returns: v.id("resourceFavorites"),
  handler: async (ctx, args) => {
    return await ResourceModel.addToFavorites(ctx, args.resourceId, args.notes);
  },
});

// Mutation to remove a resource from favorites
export const removeFromFavorites = mutation({
  args: {
    resourceId: v.id("resources"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ResourceModel.removeFromFavorites(ctx, args.resourceId);
    return null;
  },
});

// Query to get user's favorite resources
export const getFavoriteResources = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(resourceValidator),
  handler: async (ctx, args) => {
    return await ResourceModel.getFavoriteResources(ctx, args.userId);
  },
});

// Mutation to record resource access
export const recordAccess = mutation({
  args: {
    resourceId: v.id("resources"),
    accessType: v.union(
      v.literal("view"),
      v.literal("edit"),
      v.literal("share"),
      v.literal("download")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ResourceModel.recordAccess(ctx, args.resourceId, args.accessType);
    return null;
  },
});

// Query to get resource access history
export const getResourceAccessHistory = query({
  args: {
    resourceId: v.id("resources"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("resourceAccess"),
    _creationTime: v.number(),
    resourceId: v.id("resources"),
    userId: v.id("users"),
    accessType: v.union(
      v.literal("view"),
      v.literal("edit"),
      v.literal("share"),
      v.literal("download")
    ),
    accessedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourceAccessHistory(ctx, args.resourceId, args.limit);
  },
});