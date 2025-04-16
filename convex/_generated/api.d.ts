/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as board from "../board.js";
import type * as crons from "../crons.js";
import type * as designdocs from "../designdocs.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as model_activities from "../model/activities.js";
import type * as model_projects from "../model/projects.js";
import type * as model_resources from "../model/resources.js";
import type * as model_tasks from "../model/tasks.js";
import type * as model_teams from "../model/teams.js";
import type * as model_users from "../model/users.js";
import type * as products from "../products.js";
import type * as projects from "../projects.js";
import type * as resources from "../resources.js";
import type * as tasks from "../tasks.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  board: typeof board;
  crons: typeof crons;
  designdocs: typeof designdocs;
  documents: typeof documents;
  files: typeof files;
  "model/activities": typeof model_activities;
  "model/projects": typeof model_projects;
  "model/resources": typeof model_resources;
  "model/tasks": typeof model_tasks;
  "model/teams": typeof model_teams;
  "model/users": typeof model_users;
  products: typeof products;
  projects: typeof projects;
  resources: typeof resources;
  tasks: typeof tasks;
  teams: typeof teams;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
