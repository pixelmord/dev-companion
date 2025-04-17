import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
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
      v.literal("blog"),
      v.literal("podcast"),
      v.literal("github"),
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
      }),
      // Github
      v.object({
        type: v.literal("github"),
        url: v.string(),
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

  resourceVersions: defineTable({
    resourceId: v.id("resources"),
    versionNumber: v.number(),
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
    changes: v.array(v.object({
      field: v.string(),
      oldValue: v.any(),
      newValue: v.any(),
    })),
    createdBy: v.id("users"),
    createdAt: v.number(),
    message: v.optional(v.string()),
  })
    .index("by_resource", ["resourceId"])
    .index("by_resource_and_version", ["resourceId", "versionNumber"]),

  resourceComments: defineTable({
    resourceId: v.id("resources"),
    content: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    parentCommentId: v.optional(v.id("resourceComments")),
    isResolved: v.boolean(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    // For threaded discussions
    path: v.array(v.id("resourceComments")),
    depth: v.number(),
  })
    .index("by_resource", ["resourceId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_resource_and_path", ["resourceId", "path"])
    .searchIndex("search", {
      searchField: "content",
      filterFields: ["resourceId", "isResolved"],
    }),

  resourceShares: defineTable({
    resourceId: v.id("resources"),
    sharedBy: v.id("users"),
    sharedWith: v.union(
      v.object({
        type: v.literal("user"),
        userId: v.id("users"),
      }),
      v.object({
        type: v.literal("team"),
        teamId: v.id("teams"),
      }),
      v.object({
        type: v.literal("public"),
        accessCode: v.string(),
      })
    ),
    permissions: v.array(v.union(
      v.literal("view"),
      v.literal("comment"),
      v.literal("edit"),
      v.literal("share")
    )),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    lastAccessedAt: v.optional(v.number()),
    accessCount: v.number(),
  })
    .index("by_resource", ["resourceId"])
    .index("by_shared_by", ["sharedBy"])
    .index("by_shared_with_user", ["sharedWith.type", "sharedWith.userId"])
    .index("by_shared_with_team", ["sharedWith.type", "sharedWith.teamId"])
    .index("by_access_code", ["sharedWith.type", "sharedWith.accessCode"]),

  collaborationSessions: defineTable({
    resourceId: v.id("resources"),
    startedBy: v.id("users"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    participants: v.array(v.object({
      userId: v.id("users"),
      joinedAt: v.number(),
      leftAt: v.optional(v.number()),
    })),
    changes: v.array(v.object({
      userId: v.id("users"),
      timestamp: v.number(),
      type: v.union(
        v.literal("edit"),
        v.literal("comment"),
        v.literal("resolve_comment")
      ),
      details: v.any(),
    })),
  })
    .index("by_resource", ["resourceId"])
    .index("by_active", ["endedAt"])
    .index("by_participant", ["participants"]),
};

const resourceValidator = resourcesTables.resources.validator;

// Validator for creating a resource
export const createResourceSchema = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal("document"),
    v.literal("blog"),
    v.literal("codeSnippet"),
    v.literal("externalLink"),
    v.literal("podcast"),
    v.literal("github"),
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
    versionMessage: v.optional(v.string()),
  }),
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    const { id, versionMessage, ...updates } = args;
    return await ResourceModel.updateResource(ctx, id, updates, versionMessage);
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

// Query to get paginated resources for a project
export const getProjectResourcesPaginated = query({
  args: {
    projectId: v.id("projects"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(resourceValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourcesByProjectPaginated(
      ctx,
      args.projectId,
      args.paginationOpts
    );
  },
});

// Query to get paginated resources by type
export const getResourcesByTypePaginated = query({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("document"),
      v.literal("codeSnippet"),
      v.literal("externalLink"),
      v.literal("feed")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(resourceValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourcesByTypePaginated(
      ctx,
      args.projectId,
      args.type,
      args.paginationOpts
    );
  },
});

// Query to get paginated resources by tag
export const getResourcesByTagPaginated = query({
  args: {
    tag: v.string(),
    projectId: v.optional(v.id("projects")),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(resourceValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourcesByTagPaginated(
      ctx,
      args.tag,
      args.projectId,
      args.paginationOpts
    );
  },
});

// Query to get paginated search results
export const searchResourcesPaginated = query({
  args: {
    searchTerm: v.string(),
    projectId: v.optional(v.id("projects")),
    type: v.optional(v.union(
      v.literal("document"),
      v.literal("codeSnippet"),
      v.literal("externalLink"),
      v.literal("feed")
    )),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(resourceValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const { paginationOpts, ...searchArgs } = args;
    return await ResourceModel.searchResourcesPaginated(ctx, {
      ...searchArgs,
      paginationOpts,
    });
  },
});

// Query to get paginated favorite resources
export const getFavoriteResourcesPaginated = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(resourceValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getFavoriteResourcesPaginated(
      ctx,
      args.userId,
      args.paginationOpts
    );
  },
});

// Query to get paginated access history
export const getResourceAccessHistoryPaginated = query({
  args: {
    resourceId: v.id("resources"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
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
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourceAccessHistoryPaginated(
      ctx,
      args.resourceId,
      args.paginationOpts
    );
  },
});

// Query to get resource versions
export const getResourceVersions = query({
  args: {
    resourceId: v.id("resources"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("resourceVersions"),
      _creationTime: v.number(),
      resourceId: v.id("resources"),
      versionNumber: v.number(),
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
      changes: v.array(v.object({
        field: v.string(),
        oldValue: v.any(),
        newValue: v.any(),
      })),
      createdBy: v.id("users"),
      createdAt: v.number(),
      message: v.optional(v.string()),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourceVersionsPaginated(
      ctx,
      args.resourceId,
      args.paginationOpts
    );
  },
});

// Query to get a specific version
export const getResourceVersion = query({
  args: {
    resourceId: v.id("resources"),
    versionNumber: v.number(),
  },
  returns: v.union(resourcesTables.resourceVersions.validator, v.null()),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourceVersion(
      ctx,
      args.resourceId,
      args.versionNumber
    );
  },
});

// Query to get resource comments
export const getResourceComments = query({
  args: {
    resourceId: v.id("resources"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("resourceComments"),
      _creationTime: v.number(),
      resourceId: v.id("resources"),
      content: v.string(),
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
      parentCommentId: v.optional(v.id("resourceComments")),
      isResolved: v.boolean(),
      resolvedBy: v.optional(v.id("users")),
      resolvedAt: v.optional(v.number()),
      path: v.array(v.id("resourceComments")),
      depth: v.number(),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourceCommentsPaginated(
      ctx,
      args.resourceId,
      args.paginationOpts
    );
  },
});

// Mutation to add a comment
export const addComment = mutation({
  args: {
    resourceId: v.id("resources"),
    content: v.string(),
    parentCommentId: v.optional(v.id("resourceComments")),
  },
  returns: v.id("resourceComments"),
  handler: async (ctx, args) => {
    return await ResourceModel.addComment(
      ctx,
      args.resourceId,
      args.content,
      args.parentCommentId
    );
  },
});

// Mutation to update a comment
export const updateComment = mutation({
  args: {
    commentId: v.id("resourceComments"),
    content: v.string(),
  },
  returns: v.id("resourceComments"),
  handler: async (ctx, args) => {
    return await ResourceModel.updateComment(ctx, args.commentId, args.content);
  },
});

// Mutation to resolve/unresolve a comment
export const toggleCommentResolution = mutation({
  args: {
    commentId: v.id("resourceComments"),
  },
  returns: v.id("resourceComments"),
  handler: async (ctx, args) => {
    return await ResourceModel.toggleCommentResolution(ctx, args.commentId);
  },
});

// Mutation to create a share link
export const createShareLink = mutation({
  args: {
    resourceId: v.id("resources"),
    permissions: v.array(v.union(
      v.literal("view"),
      v.literal("comment"),
      v.literal("edit"),
      v.literal("share")
    )),
    expiresAt: v.optional(v.number()),
  },
  returns: v.object({
    shareId: v.id("resourceShares"),
    accessCode: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.createShareLink(
      ctx,
      args.resourceId,
      args.permissions,
      args.expiresAt
    );
  },
});

// Mutation to share with user or team
export const shareWithTarget = mutation({
  args: {
    resourceId: v.id("resources"),
    target: v.union(
      v.object({
        type: v.literal("user"),
        userId: v.id("users"),
      }),
      v.object({
        type: v.literal("team"),
        teamId: v.id("teams"),
      })
    ),
    permissions: v.array(v.union(
      v.literal("view"),
      v.literal("comment"),
      v.literal("edit"),
      v.literal("share")
    )),
    expiresAt: v.optional(v.number()),
  },
  returns: v.id("resourceShares"),
  handler: async (ctx, args) => {
    return await ResourceModel.shareWithTarget(
      ctx,
      args.resourceId,
      args.target,
      args.permissions,
      args.expiresAt
    );
  },
});

// Query to get shares for a resource
export const getResourceShares = query({
  args: {
    resourceId: v.id("resources"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("resourceShares"),
      _creationTime: v.number(),
      resourceId: v.id("resources"),
      sharedBy: v.id("users"),
      sharedWith: v.union(
        v.object({
          type: v.literal("user"),
          userId: v.id("users"),
        }),
        v.object({
          type: v.literal("team"),
          teamId: v.id("teams"),
        }),
        v.object({
          type: v.literal("public"),
          accessCode: v.string(),
        })
      ),
      permissions: v.array(v.union(
        v.literal("view"),
        v.literal("comment"),
        v.literal("edit"),
        v.literal("share")
      )),
      expiresAt: v.optional(v.number()),
      createdAt: v.number(),
      lastAccessedAt: v.optional(v.number()),
      accessCount: v.number(),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getResourceSharesPaginated(
      ctx,
      args.resourceId,
      args.paginationOpts
    );
  },
});

// Query to get shared resources
export const getSharedWithMe = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(resourcesTables.resources.validator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ResourceModel.getSharedWithMePaginated(ctx, args.paginationOpts);
  },
});

// Mutation to start a collaboration session
export const startCollaborationSession = mutation({
  args: {
    resourceId: v.id("resources"),
  },
  returns: v.id("collaborationSessions"),
  handler: async (ctx, args) => {
    return await ResourceModel.startCollaborationSession(ctx, args.resourceId);
  },
});

// Mutation to join a collaboration session
export const joinCollaborationSession = mutation({
  args: {
    sessionId: v.id("collaborationSessions"),
  },
  returns: v.id("collaborationSessions"),
  handler: async (ctx, args) => {
    return await ResourceModel.joinCollaborationSession(ctx, args.sessionId);
  },
});

// Mutation to leave a collaboration session
export const leaveCollaborationSession = mutation({
  args: {
    sessionId: v.id("collaborationSessions"),
  },
  returns: v.id("collaborationSessions"),
  handler: async (ctx, args) => {
    return await ResourceModel.leaveCollaborationSession(ctx, args.sessionId);
  },
});

// Query to get active collaboration sessions for a resource
export const getActiveCollaborationSessions = query({
  args: {
    resourceId: v.id("resources"),
  },
  returns: v.array(v.object({
    _id: v.id("collaborationSessions"),
    _creationTime: v.number(),
    resourceId: v.id("resources"),
    startedBy: v.id("users"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    participants: v.array(v.object({
      userId: v.id("users"),
      joinedAt: v.number(),
      leftAt: v.optional(v.number()),
    })),
    changes: v.array(v.object({
      userId: v.id("users"),
      timestamp: v.number(),
      type: v.union(
        v.literal("edit"),
        v.literal("comment"),
        v.literal("resolve_comment")
      ),
      details: v.any(),
    })),
  })),
  handler: async (ctx, args) => {
    return await ResourceModel.getActiveCollaborationSessions(ctx, args.resourceId);
  },
});