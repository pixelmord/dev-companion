import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { boardTables } from "./board";
import { teamsTables } from "./teams";
import { usersTables } from "./users";
import { projectsTables } from "./projects";
import { resourcesTables } from "./resources";
import { activityTables } from "./activities";
import { designDocsTables } from "./design-docs";
import { tasksTables } from "./tasks";
import { projectTables } from "./products";

const schema = defineSchema({
	// User and team management
	...usersTables,
	...teamsTables,
	...projectsTables,
	...resourcesTables,
	...activityTables,
	...designDocsTables,
	...tasksTables,
	...projectTables,
	...boardTables,
});

export default schema;
