import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// Type for project creation
type CreateProjectArgs = {
  name: string;
  description?: string;
  visibility: "public" | "private";
  teamId: Id<"teams">;
};

// Type for project updates
type UpdateProjectArgs = Partial<{
  name: string;
  description: string;
  visibility: "public" | "private";
  status: "active" | "archived" | "completed";
  settings: {
    allowComments: boolean;
    notificationsEnabled: boolean;
    defaultResourceVisibility: "public" | "team" | "private";
  };
}>;

// Get a project by ID
export async function getProject(
  ctx: QueryCtx,
  id: Id<"projects">
) {
  return await ctx.db.get(id);
}

// Get all projects for a team
export async function getProjectsByTeam(
  ctx: QueryCtx,
  teamId: Id<"teams">
) {
  return await ctx.db
    .query("projects")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect();
}

// Create a new project
export async function createProject(
  ctx: MutationCtx,
  args: CreateProjectArgs
) {
  const { name, description, visibility, teamId } = args;

  // Verify team exists
  const team = await ctx.db.get(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Create project with default settings
  const projectId = await ctx.db.insert("projects", {
    name,
    description,
    visibility,
    teamId,
    status: "active",
    settings: {
      allowComments: true,
      notificationsEnabled: true,
      defaultResourceVisibility: "team",
    },
    createdBy: identity.subject as Id<"users">,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return projectId;
}

// Update a project
export async function updateProject(
  ctx: MutationCtx,
  id: Id<"projects">,
  updates: UpdateProjectArgs
) {
  // Verify project exists
  const project = await ctx.db.get(id);
  if (!project) {
    throw new Error("Project not found");
  }

  // Apply updates
  await ctx.db.patch(id, {
    ...updates,
    updatedAt: Date.now(),
  });

  return id;
}