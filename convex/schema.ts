import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { boardTables } from "./board";
import { teamsTables } from "./teams";
import { usersTables } from "./users";
import { projectsTables } from "./projects";
import { resourcesTables } from "./resources";
import { activityTables } from "./activities";
import { designDocsTables } from "./designdocs";
import { tasksTables } from "./tasks";
import { projectTables } from "./products";
import { documentsTables } from "./documents";

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
	// Document tables
	...documentsTables,

});

export default schema;
