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