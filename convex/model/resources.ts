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

  // Create resource
  const resourceId = await ctx.db.insert("resources", {
    name,
    description,
    type,
    projectId,
    visibility,
    content,
    createdBy: ctx.auth.subject as Id<"users">,
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