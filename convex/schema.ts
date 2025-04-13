import { defineSchema } from "convex/server";
import { boardTables } from "./board";
import { teamsTables } from "./teams";
import { usersTables } from "./users";
import { projectsTables } from "./projects";
import { resourcesTables } from "./resources";
import { activityTables } from "./activities";
import { designDocsTables } from "./designdocs";
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
