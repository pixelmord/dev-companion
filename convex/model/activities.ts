import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// Type for activity recording
type RecordActivityArgs = {
  type: "create" | "update" | "delete" | "share" | "comment" | "react";
  entityType: "project" | "resource" | "team" | "user";
  entityId: Id<"projects"> | Id<"resources"> | Id<"teams"> | Id<"users">;
  details: {
    summary: string;
    changes?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    metadata?: {
      resourceType?: string;
      visibility?: string;
      teamName?: string;
    };
  };
  projectId?: Id<"projects">;
  teamId?: Id<"teams">;
};

// Type for pagination options
type PaginationOpts = {
  numItems: number;
  cursor: string | null;
};

// Get activities by project
export async function getActivitiesByProject(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  limit?: number
) {
  const query = ctx.db
    .query("activities")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .order("desc");

  if (limit !== undefined) {
    return await query.take(limit);
  }
  return await query.collect();
}

// Get activities by team
export async function getActivitiesByTeam(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  limit?: number
) {
  const query = ctx.db
    .query("activities")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .order("desc");

  if (limit !== undefined) {
    return await query.take(limit);
  }
  return await query.collect();
}

// Get activities by user
export async function getActivitiesByUser(
  ctx: QueryCtx,
  userId: Id<"users">,
  limit?: number
) {
  const query = ctx.db
    .query("activities")
    .withIndex("by_user", (q) => q.eq("performedBy", userId))
    .order("desc");

  if (limit !== undefined) {
    return await query.take(limit);
  }
  return await query.collect();
}

// Get activities by entity
export async function getActivitiesByEntity(
  ctx: QueryCtx,
  entityType: "project" | "resource" | "team" | "user",
  entityId: Id<"projects"> | Id<"resources"> | Id<"teams"> | Id<"users">,
  limit?: number
) {
  const query = ctx.db
    .query("activities")
    .withIndex("by_entity", (q) =>
      q.eq("entityType", entityType).eq("entityId", entityId)
    )
    .order("desc");

  if (limit !== undefined) {
    return await query.take(limit);
  }
  return await query.collect();
}

// Record a new activity
export async function recordActivity(
  ctx: MutationCtx,
  args: RecordActivityArgs
) {
  const { type, entityType, entityId, details, projectId, teamId } = args;

  // Get the authenticated user ID
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Create activity record
  const activityId = await ctx.db.insert("activities", {
    type,
    entityType,
    entityId,
    details,
    projectId,
    teamId,
    performedBy: identity.subject as Id<"users">,
    performedAt: Date.now(),
  });

  return activityId;
}

// Get paginated activities by project
export async function getActivitiesByProjectPaginated(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("activities")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .order("desc")
    .paginate(paginationOpts);
}

// Get paginated activities by team
export async function getActivitiesByTeamPaginated(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("activities")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .order("desc")
    .paginate(paginationOpts);
}

// Get paginated activities by user
export async function getActivitiesByUserPaginated(
  ctx: QueryCtx,
  userId: Id<"users">,
  paginationOpts: PaginationOpts
) {
  return await ctx.db
    .query("activities")
    .withIndex("by_user", (q) => q.eq("performedBy", userId))
    .order("desc")
    .paginate(paginationOpts);
}