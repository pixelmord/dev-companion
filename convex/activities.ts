import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as ActivityModel from "./model/activities";

export const activityTables = {
  activities: defineTable({
    // Action metadata
    type: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("share"),
      v.literal("comment"),
      v.literal("react")
    ),

    // Entity references
    entityType: v.union(
      v.literal("project"),
      v.literal("resource"),
      v.literal("team"),
      v.literal("user")
    ),
    entityId: v.union(
      v.id("projects"),
      v.id("resources"),
      v.id("teams"),
      v.id("users")
    ),

    // Additional context
    details: v.object({
      summary: v.string(),
      changes: v.optional(v.array(v.object({
        field: v.string(),
        oldValue: v.any(),
        newValue: v.any(),
      }))),
      metadata: v.optional(v.object({
        resourceType: v.optional(v.string()),
        visibility: v.optional(v.string()),
        teamName: v.optional(v.string()),
      })),
    }),

    // Project context (optional, for filtering activities by project)
    projectId: v.optional(v.id("projects")),

    // Team context (optional, for filtering activities by team)
    teamId: v.optional(v.id("teams")),

    // Audit fields
    performedBy: v.id("users"),
    performedAt: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_project", ["projectId"])
    .index("by_team", ["teamId"])
    .index("by_user", ["performedBy"])
    .index("by_recent", ["performedAt"]),
};

const activityValidator = activityTables.activities.validator;

// Query to get activities for a project
export const getProjectActivities = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  returns: v.array(activityValidator),
  handler: async (ctx, args) => {
    return await ActivityModel.getActivitiesByProject(ctx, args.projectId, args.limit);
  },
});

// Query to get activities for a team
export const getTeamActivities = query({
  args: {
    teamId: v.id("teams"),
    limit: v.optional(v.number()),
  },
  returns: v.array(activityValidator),
  handler: async (ctx, args) => {
    return await ActivityModel.getActivitiesByTeam(ctx, args.teamId, args.limit);
  },
});

// Query to get activities for a user
export const getUserActivities = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  returns: v.array(activityValidator),
  handler: async (ctx, args) => {
    return await ActivityModel.getActivitiesByUser(ctx, args.userId, args.limit);
  },
});

// Query to get activities for an entity
export const getEntityActivities = query({
  args: {
    entityType: v.union(
      v.literal("project"),
      v.literal("resource"),
      v.literal("team"),
      v.literal("user")
    ),
    entityId: v.union(
      v.id("projects"),
      v.id("resources"),
      v.id("teams"),
      v.id("users")
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(activityValidator),
  handler: async (ctx, args) => {
    return await ActivityModel.getActivitiesByEntity(ctx, args.entityType, args.entityId, args.limit);
  },
});

// Mutation to record an activity
export const recordActivity = mutation({
  args: {
    type: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("share"),
      v.literal("comment"),
      v.literal("react")
    ),
    entityType: v.union(
      v.literal("project"),
      v.literal("resource"),
      v.literal("team"),
      v.literal("user")
    ),
    entityId: v.union(
      v.id("projects"),
      v.id("resources"),
      v.id("teams"),
      v.id("users")
    ),
    details: v.object({
      summary: v.string(),
      changes: v.optional(v.array(v.object({
        field: v.string(),
        oldValue: v.any(),
        newValue: v.any(),
      }))),
      metadata: v.optional(v.object({
        resourceType: v.optional(v.string()),
        visibility: v.optional(v.string()),
        teamName: v.optional(v.string()),
      })),
    }),
    projectId: v.optional(v.id("projects")),
    teamId: v.optional(v.id("teams")),
  },
  returns: v.id("activities"),
  handler: async (ctx, args) => {
    return await ActivityModel.recordActivity(ctx, args);
  },
});