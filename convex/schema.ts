
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { boardTables } from "./board";
import { teamsTables } from "./teams";
const schema = defineSchema({
	tasks: defineTable({
		text: v.string(),
		description: v.optional(v.string()),
		isCompleted: v.boolean(),
	}),
	designDocs: defineTable({
		name: v.string(),
		teamId: v.string(),
		createdBy: v.id("users"),
		archived: v.boolean(),
		document: v.string(),
		whiteboard: v.string(),
	}),
	products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
	...teamsTables,
	...boardTables,
});
export default schema;
