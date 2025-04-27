import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export async function getTasksByTeam(
  ctx: QueryCtx,
  teamId: Id<"teams">
): Promise<Doc<"tasks">[]> {
  return await ctx.db
    .query("tasks")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect();
}

export async function getTasksByAssignee(
  ctx: QueryCtx,
  assignedTo: Id<"users">
): Promise<Doc<"tasks">[]> {
  return await ctx.db
    .query("tasks")
    .withIndex("by_assigned", (q) => q.eq("assignedTo", assignedTo))
    .collect();
}

export async function createTask(
  ctx: MutationCtx,
  {
    text,
    description,
    teamId,
    assignedTo,
    createdBy,
  }: {
    text: string;
    description?: string;
    teamId?: Id<"teams">;
    assignedTo?: Id<"users">;
    createdBy: Id<"users">;
  }
): Promise<Id<"tasks">> {
  const now = Date.now();
  return await ctx.db.insert("tasks", {
    text,
    description,
    teamId,
    assignedTo,
    isCompleted: false,
    createdBy,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateTaskStatus(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  isCompleted: boolean
): Promise<void> {
  const task = await ctx.db.get(taskId);
  if (!task) {
    throw new ConvexError("Task not found");
  }

  await ctx.db.patch(taskId, {
    isCompleted,
    updatedAt: Date.now(),
  });
}

export async function ensureTaskAccess(
  ctx: QueryCtx,
  taskId: Id<"tasks">,
  userId: Id<"users">
): Promise<Doc<"tasks">> {
  const task = await ctx.db.get(taskId);
  if (!task) {
    throw new ConvexError("Task not found");
  }

  // Allow access if user created the task or is assigned to it
  if (task.createdBy !== userId && task.assignedTo !== userId) {
    throw new ConvexError("Unauthorized");
  }

  return task;
}