import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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
  updates: UpdateResourceArgs
) {
  // Verify resource exists
  const resource = await ctx.db.get(id);
  if (!resource) {
    throw new Error("Resource not found");
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