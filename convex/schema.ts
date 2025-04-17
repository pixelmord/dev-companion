import { defineSchema } from "convex/server";
import { NoOp } from "convex-helpers/server/customFunctions";
import { zCustomMutation, zCustomQuery } from "convex-helpers/server/zod";
import { mutation, query } from "./_generated/server";
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

export const zodQuery = zCustomQuery(query, NoOp);
export const zodMutation = zCustomMutation(mutation, NoOp);

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
