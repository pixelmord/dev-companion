import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

// Type for resource content
type ResourceContent = {
  type: "document";
  content: string;
  format: string;
  version: number;
} | {
  type: "codeSnippet";
  code: string;
  language: string;
  highlightOptions?: {
    theme: string;
    lineNumbers: boolean;
  };
} | {
  type: "externalLink";
  url: string;
  favicon?: string;
  lastChecked: number;
} | {
  type: "feed";
  source: string;
  refreshFrequency: number;
  lastUpdated: number;
};

// Type for resource creation
type CreateResourceArgs = {
  name: string;
  description?: string;
  type: "document" | "codeSnippet" | "externalLink" | "feed";
  projectId: Id<"projects">;
  visibility: "public" | "team" | "private";
  content: ResourceContent;
};

// Type for resource updates
type UpdateResourceArgs = Partial<{
  name: string;
  description: string;
  visibility: "public" | "team" | "private";
  content: ResourceContent;
}>;

// Type for search args
type SearchResourcesArgs = {
  searchTerm: string;
  projectId?: Id<"projects">;
  type?: "document" | "codeSnippet" | "externalLink" | "feed";
  limit?: number;
};

// Update PaginationOpts type to match Convex standard
type PaginationOpts = {
  numItems: number;
  cursor: string | null;
};

// Type for share target
type ShareTarget = {
  type: "user";
  userId: Id<"users">;
} | {
  type: "team";
  teamId: Id<"teams">;
};

// Type for share permissions
type SharePermission = "view" | "comment" | "edit" | "share";

// Get a resource by ID
export async function getResource(
  ctx: QueryCtx,
  id: Id<"resources">
) {
  return await ctx.db.get(id);
}

// Get all resources for a project
export async function getResourcesByProject(
  ctx: QueryCtx,
  projectId: Id<"projects">
) {
  return await ctx.db
    .query("resources")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();
}

// Get resources by type for a project
export async function getResourcesByType(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  type: "document" | "codeSnippet" | "externalLink" | "feed"
) {
  return await ctx.db
    .query("resources")
    .withIndex("by_project_and_type", (q) =>
      q.eq("projectId", projectId).eq("type", type)
    )
    .collect();
}

// Create a new resource
export async function createResource(
  ctx: MutationCtx,
  args: CreateResourceArgs
) {
  const { name, description, type, projectId, visibility, content } = args;

  // Verify project exists
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Create resource
  const resourceId = await ctx.db.insert("resources", {
    name,
    description,
    type,
    projectId,
    visibility,
    content,
    tags: [],
    accessCount: 0,
    createdBy: identity.subject as Id<"users">,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return resourceId;
}

// Update a resource
export async function updateResource(
  ctx: MutationCtx,
  id: Id<"resources">,
  updates: UpdateResourceArgs,
  versionMessage?: string
) {
  // Verify resource exists
  const resource = await ctx.db.get(id);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Track changes for versioning
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

  // Compare and record changes
  for (const [key, value] of Object.entries(updates)) {
    if (JSON.stringify(resource[key as keyof typeof resource]) !== JSON.stringify(value)) {
      changes.push({
        field: key,
        oldValue: resource[key as keyof typeof resource],
        newValue: value
      });
    }
  }

  // If there are changes, create a new version
  if (changes.length > 0 && updates.content) {
    await createResourceVersion(
      ctx,
      id,
      updates.content,
      changes,
      versionMessage
    );
  }

  // Apply updates
  await ctx.db.patch(id, {
    ...updates,
    updatedAt: Date.now(),
  });

  return id;
}

// Search resources
export async function searchResources(
  ctx: QueryCtx,
  args: SearchResourcesArgs
) {
  const { searchTerm, projectId, type, limit } = args;

  // Start with search query
  let query = ctx.db
    .query("resources")
    .withSearchIndex("search", (q) => {
      let search = q.search("name", searchTerm);

      if (projectId) {
        search = search.eq("projectId", projectId);
      }

      if (type) {
        search = search.eq("type", type);
      }

      return search;
    });

  // Add limit if specified
  if (limit !== undefined) {
    return await query.take(limit);
  }

  return await query.collect();
}

// Share a resource
export async function shareResource(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  visibility: "public" | "team" | "private"
) {
  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Update visibility
  await ctx.db.patch(resourceId, {
    visibility,
    updatedAt: Date.now(),
  });

  // Record share activity
  await ctx.db.insert("activities", {
    type: "share",
    entityType: "resource",
    entityId: resourceId,
    details: {
      summary: `Changed resource visibility to ${visibility}`,
      changes: [{
        field: "visibility",
        oldValue: resource.visibility,
        newValue: visibility,
      }],
    },
    projectId: resource.projectId,
    performedBy: identity.subject as Id<"users">,
    performedAt: Date.now(),
  });

  return resourceId;
}

// Add tags to a resource
export async function addTags(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  tags: string[]
) {
  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Get current tags and add new ones (deduplicating)
  const currentTags = resource.tags || [];
  const newTags = [...new Set([...currentTags, ...tags])];

  // Update resource
  await ctx.db.patch(resourceId, {
    tags: newTags,
    updatedAt: Date.now(),
  });

  return resourceId;
}

// Remove tags from a resource
export async function removeTags(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  tags: string[]
) {
  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Filter out tags to remove
  const newTags = (resource.tags || []).filter(tag => !tags.includes(tag));

  // Update resource
  await ctx.db.patch(resourceId, {
    tags: newTags,
    updatedAt: Date.now(),
  });

  return resourceId;
}

// Get resources by tag
export async function getResourcesByTag(
  ctx: QueryCtx,
  tag: string,
  projectId?: Id<"projects">
) {
  let query = ctx.db.query("resources").withIndex("by_tag", (q) => q.eq("tags", [tag]));

  if (projectId) {
    query = query.filter((q) => q.eq(q.field("projectId"), projectId));
  }

  return await query.collect();
}

// Add a resource to favorites
export async function addToFavorites(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  notes?: string
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Check if already favorited
  const existing = await ctx.db
    .query("resourceFavorites")
    .withIndex("by_user_and_resource", (q) =>
      q.eq("userId", userId).eq("resourceId", resourceId)
    )
    .unique();

  if (existing) {
    // Update notes if provided
    if (notes !== undefined) {
      await ctx.db.patch(existing._id, { notes });
    }
    return existing._id;
  }

  // Add new favorite
  return await ctx.db.insert("resourceFavorites", {
    resourceId,
    userId,
    notes,
    createdAt: Date.now(),
  });
}

// Remove a resource from favorites
export async function removeFromFavorites(
  ctx: MutationCtx,
  resourceId: Id<"resources">
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Find and delete favorite
  const favorite = await ctx.db
    .query("resourceFavorites")
    .withIndex("by_user_and_resource", (q) =>
      q.eq("userId", userId).eq("resourceId", resourceId)
    )
    .unique();

  if (favorite) {
    await ctx.db.delete(favorite._id);
  }
}

// Get user's favorite resources
export async function getFavoriteResources(
  ctx: QueryCtx,
  userId: Id<"users">
) {
  const favorites = await ctx.db
    .query("resourceFavorites")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Get the actual resources
  const resources = await Promise.all(
    favorites.map(fav => ctx.db.get(fav.resourceId))
  );

  return resources.filter((r): r is NonNullable<typeof r> => r !== null);
}

// Record resource access
export async function recordAccess(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  accessType: "view" | "edit" | "share" | "download"
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Get current resource
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Record access
  await ctx.db.insert("resourceAccess", {
    resourceId,
    userId,
    accessType,
    accessedAt: Date.now(),
  });

  // Update resource access stats
  await ctx.db.patch(resourceId, {
    lastAccessedAt: Date.now(),
    accessCount: resource.accessCount + 1,
  });
}

// Get resource access history
export async function getResourceAccessHistory(
  ctx: QueryCtx,
  resourceId: Id<"resources">,
  limit?: number
) {
  const query = ctx.db
    .query("resourceAccess")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .order("desc");

  if (limit !== undefined) {
    return await query.take(limit);
  }

  return await query.collect();
}

// Get paginated resources for a project
export async function getResourcesByProjectPaginated(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("resources")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .paginate(paginationOpts);
}

// Get paginated resources by type for a project
export async function getResourcesByTypePaginated(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  type: "document" | "codeSnippet" | "externalLink" | "feed",
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("resources")
    .withIndex("by_project_and_type", (q) =>
      q.eq("projectId", projectId).eq("type", type)
    )
    .paginate(paginationOpts);
}

// Get paginated resources by tag
export async function getResourcesByTagPaginated(
  ctx: QueryCtx,
  tag: string,
  projectId: Id<"projects"> | undefined,
  paginationOpts: PaginationOpts
) {
  let query = ctx.db
    .query("resources")
    .withIndex("by_tag", (q) => q.eq("tags", [tag]));

  if (projectId) {
    query = query.filter((q) => q.eq(q.field("projectId"), projectId));
  }

  return await query.paginate(paginationOpts);
}

// Get paginated search results
export async function searchResourcesPaginated(
  ctx: QueryCtx,
  args: SearchResourcesArgs & { paginationOpts: PaginationOpts }
) {
  const { searchTerm, projectId, type, paginationOpts } = args;

  return await ctx.db
    .query("resources")
    .withSearchIndex("search", (q) => {
      let search = q.search("name", searchTerm);

      if (projectId) {
        search = search.eq("projectId", projectId);
      }

      if (type) {
        search = search.eq("type", type);
      }

      return search;
    })
    .paginate(paginationOpts);
}

// Get paginated favorite resources
export async function getFavoriteResourcesPaginated(
  ctx: QueryCtx,
  userId: Id<"users">,
  paginationOpts: PaginationOpts
) {
  const favoritesPage = await ctx.db
    .query("resourceFavorites")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .paginate(paginationOpts);

  // Get the actual resources for this page
  const resources = await Promise.all(
    favoritesPage.page.map(fav => ctx.db.get(fav.resourceId))
  );

  return {
    page: resources.filter((r): r is NonNullable<typeof r> => r !== null),
    isDone: favoritesPage.isDone,
    continueCursor: favoritesPage.continueCursor,
  };
}

// Get paginated access history
export async function getResourceAccessHistoryPaginated(
  ctx: QueryCtx,
  resourceId: Id<"resources">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("resourceAccess")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .paginate(paginationOpts);
}

// Get paginated versions for a resource
export async function getResourceVersionsPaginated(
  ctx: QueryCtx,
  resourceId: Id<"resources">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("resourceVersions")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .paginate(paginationOpts);
}

// Get a specific version of a resource
export async function getResourceVersion(
  ctx: QueryCtx,
  resourceId: Id<"resources">,
  versionNumber: number
) {
  return await ctx.db
    .query("resourceVersions")
    .withIndex("by_resource_and_version", (q) =>
      q.eq("resourceId", resourceId).eq("versionNumber", versionNumber)
    )
    .unique();
}

// Create a new version when updating a resource
export async function createResourceVersion(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  content: ResourceContent,
  changes: Array<{ field: string; oldValue: any; newValue: any }>,
  message?: string
) {
  // Get the current version number
  const latestVersion = await ctx.db
    .query("resourceVersions")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .order("desc")
    .first();

  const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Create new version
  return await ctx.db.insert("resourceVersions", {
    resourceId,
    versionNumber,
    content,
    changes,
    message,
    createdBy: identity.subject as Id<"users">,
    createdAt: Date.now(),
  });
}

// Get paginated comments for a resource
export async function getResourceCommentsPaginated(
  ctx: QueryCtx,
  resourceId: Id<"resources">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("resourceComments")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .paginate(paginationOpts);
}

// Add a comment to a resource
export async function addComment(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  content: string,
  parentCommentId?: Id<"resourceComments">
) {
  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // If this is a reply, get the parent comment to build the path
  let path: Id<"resourceComments">[] = [];
  let depth = 0;

  if (parentCommentId) {
    const parentComment = await ctx.db.get(parentCommentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }
    path = [...parentComment.path, parentCommentId];
    depth = parentComment.depth + 1;
  }

  // Create comment
  return await ctx.db.insert("resourceComments", {
    resourceId,
    content,
    createdBy: userId,
    createdAt: Date.now(),
    parentCommentId,
    isResolved: false,
    path,
    depth,
  });
}

// Update a comment
export async function updateComment(
  ctx: MutationCtx,
  commentId: Id<"resourceComments">,
  content: string
) {
  // Verify comment exists and user owns it
  const comment = await ctx.db.get(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== comment.createdBy) {
    throw new Error("Not authorized to update this comment");
  }

  // Update comment
  await ctx.db.patch(commentId, {
    content,
    updatedAt: Date.now(),
  });

  return commentId;
}

// Toggle comment resolution status
export async function toggleCommentResolution(
  ctx: MutationCtx,
  commentId: Id<"resourceComments">
) {
  // Verify comment exists
  const comment = await ctx.db.get(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Toggle resolution status
  const isResolved = !comment.isResolved;
  await ctx.db.patch(commentId, {
    isResolved,
    resolvedBy: isResolved ? userId : undefined,
    resolvedAt: isResolved ? Date.now() : undefined,
  });

  return commentId;
}

// Create a share link for a resource
export async function createShareLink(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  permissions: SharePermission[],
  expiresAt?: number
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Generate a random access code
  const accessCode = generateAccessCode();

  // Create share record
  const shareId = await ctx.db.insert("resourceShares", {
    resourceId,
    sharedBy: userId,
    sharedWith: {
      type: "public",
      accessCode,
    },
    permissions,
    expiresAt,
    createdAt: Date.now(),
    accessCount: 0,
  });

  return { shareId, accessCode };
}

// Share a resource with a user or team
export async function shareWithTarget(
  ctx: MutationCtx,
  resourceId: Id<"resources">,
  target: ShareTarget,
  permissions: SharePermission[],
  expiresAt?: number
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Create share record
  return await ctx.db.insert("resourceShares", {
    resourceId,
    sharedBy: userId,
    sharedWith: target,
    permissions,
    expiresAt,
    createdAt: Date.now(),
    accessCount: 0,
  });
}

// Get paginated shares for a resource
export async function getResourceSharesPaginated(
  ctx: QueryCtx,
  resourceId: Id<"resources">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("resourceShares")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .paginate(paginationOpts);
}

// Get paginated resources shared with the current user
export async function getSharedWithMePaginated(
  ctx: QueryCtx,
  paginationOpts: PaginationOpts
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Get shares for this user
  const sharesPage = await ctx.db
    .query("resourceShares")
    .withIndex("by_shared_with_user", (q) =>
      q.eq("sharedWith.type", "user").eq("sharedWith.userId", userId)
    )
    .paginate(paginationOpts);

  // Get the actual resources
  const resources = await Promise.all(
    sharesPage.page.map(share => ctx.db.get(share.resourceId))
  );

  return {
    page: resources.filter((r): r is NonNullable<typeof r> => r !== null),
    isDone: sharesPage.isDone,
    continueCursor: sharesPage.continueCursor,
  };
}

// Start a collaboration session
export async function startCollaborationSession(
  ctx: MutationCtx,
  resourceId: Id<"resources">
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Verify resource exists
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error("Resource not found");
  }

  // Create session
  return await ctx.db.insert("collaborationSessions", {
    resourceId,
    startedBy: userId,
    startedAt: Date.now(),
    participants: [{
      userId,
      joinedAt: Date.now(),
    }],
    changes: [],
  });
}

// Join a collaboration session
export async function joinCollaborationSession(
  ctx: MutationCtx,
  sessionId: Id<"collaborationSessions">
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Get the session
  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.endedAt) {
    throw new Error("Session has ended");
  }

  // Check if user is already in the session
  const participant = session.participants.find(p => p.userId === userId);
  if (participant && !participant.leftAt) {
    return sessionId;
  }

  // Add user to participants
  await ctx.db.patch(sessionId, {
    participants: [
      ...session.participants,
      {
        userId,
        joinedAt: Date.now(),
      },
    ],
  });

  return sessionId;
}

// Leave a collaboration session
export async function leaveCollaborationSession(
  ctx: MutationCtx,
  sessionId: Id<"collaborationSessions">
) {
  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject as Id<"users">;

  // Get the session
  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.endedAt) {
    throw new Error("Session has already ended");
  }

  // Update participant's leftAt time
  const participants = session.participants.map(p =>
    p.userId === userId && !p.leftAt
      ? { ...p, leftAt: Date.now() }
      : p
  );

  // If all participants have left, end the session
  const hasActiveParticipants = participants.some(p => !p.leftAt);
  const updates: any = { participants };
  if (!hasActiveParticipants) {
    updates.endedAt = Date.now();
  }

  await ctx.db.patch(sessionId, updates);
  return sessionId;
}

// Get active collaboration sessions for a resource
export async function getActiveCollaborationSessions(
  ctx: QueryCtx,
  resourceId: Id<"resources">
) {
  return await ctx.db
    .query("collaborationSessions")
    .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
    .filter((q) => q.eq(q.field("endedAt"), undefined))
    .collect();
}

// Helper function to generate a random access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}