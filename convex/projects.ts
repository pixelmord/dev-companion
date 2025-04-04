import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as ProjectModel from "./model/projects";

export const projectsTables = {
  projects: defineTable({
    // Basic info
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),

    // Team association
    teamId: v.id("teams"),

    // Project status
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("completed")
    ),

    // Project settings
    settings: v.object({
      allowComments: v.boolean(),
      notificationsEnabled: v.boolean(),
      defaultResourceVisibility: v.union(
        v.literal("public"),
        v.literal("team"),
        v.literal("private")
      ),
    }),

    // Audit fields
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_status", ["status"])
    .index("by_team_and_status", ["teamId", "status"]),
};

const projectValidator = projectsTables.projects.validator;

// Validator for creating a project
export const createProjectSchema = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  visibility: v.union(v.literal("public"), v.literal("private")),
  teamId: v.id("teams"),
});

// Validator for updating a project
export const updateProjectSchema = v.object({
  id: v.id("projects"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  status: v.optional(v.union(
    v.literal("active"),
    v.literal("archived"),
    v.literal("completed")
  )),
  settings: v.optional(v.object({
    allowComments: v.boolean(),
    notificationsEnabled: v.boolean(),
    defaultResourceVisibility: v.union(
      v.literal("public"),
      v.literal("team"),
      v.literal("private")
    ),
  })),
});

// Query to get all projects for a team
export const getTeamProjects = query({
  args: { teamId: v.id("teams") },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    return await ProjectModel.getProjectsByTeam(ctx, args.teamId);
  },
});

// Query to get a specific project
export const getProject = query({
  args: { id: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    return await ProjectModel.getProject(ctx, args.id);
  },
});

// Mutation to create a new project
export const createProject = mutation({
  args: createProjectSchema,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    return await ProjectModel.createProject(ctx, args);
  },
});

// Mutation to update a project
export const updateProject = mutation({
  args: updateProjectSchema,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ProjectModel.updateProject(ctx, id, updates);
  },
});

// Mutation to archive a project
export const archiveProject = mutation({
  args: { id: v.id("projects") },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    return await ProjectModel.updateProject(ctx, args.id, {
      status: "archived",
    });
  },
});