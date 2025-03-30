import { defineTable } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const teamsTables = {
	teams: defineTable({
		id: v.string(),
		name: v.string(),
		createdBy: v.id("users"),
		members: v.array(v.id("users")),
	}),
};

const team = teamsTables.teams.validator;

export const updateTeamSchema = v.object({
	id: team.fields.id,
	name: v.optional(team.fields.name),
	members: v.optional(team.fields.members),
});

export const getTeams = query(async (ctx) => {
	return await ctx.db.query("teams").collect();
});

export const createTeam = mutation({
	args: team,
	handler: async (ctx, args) => {
		return await ctx.db.insert("teams", args);
	},
});
