import type { Doc, Id } from "@convex-server/_generated/dataModel";
type User = Doc<"users">;

export type Team = {
	id: string;
	name: string;
	avatar: string;
	description: string;
	members: string[]; // User IDs
	projects: string[]; // Project IDs
};

export type Project = {
	id: string;
	name: string;
	description: string;
	githubUrl: string;
	teamId: string;
	resources: Resource[];
};

export type ResourceType =
	| "externalLink"
	| "github"
	| "codeSnippet"
	| "blog"
	| "podcast";

export type Resource = {
	id: string;
	title: string;
	description: string;
	url: string;
	type: ResourceType;
	tags: string[];
	projectId: string;
	addedAt: string;
};

export type MicroPost = {
	id: string;
	userId: string;
	content: string;
	tags: string[];
	postedAt: string;
	likes: string[]; // User IDs who liked
	comments: MicroPostComment[];
	attachedResourceId?: string; // Optional: link to a resource
	attachedProjectId?: string; // Optional: link to a project
	codeSnippet?: {
		code: string;
		language: string;
	};
};

export type MicroPostComment = {
	id: string;
	userId: string;
	content: string;
	postedAt: string;
};

export type AppContextType = {
	currentUser: User | null;
	teams: Team[];
	projects: Project[];
	resources: Resource[];
	connections: User[];
	microPosts: MicroPost[];
	setCurrentUser: (user: User) => void;
	addTeam: (team: Team) => void;
	addProject: (project: Project) => void;
	addResource: (resource: Resource) => void;
	addConnection: (user: User) => void;
	addMicroPost: (post: MicroPost) => void;
	likeMicroPost: (postId: string, userId: string) => void;
	addMicroPostComment: (postId: string, comment: MicroPostComment) => void;
};

// Mock Data
export const mockUser: User = {
	id: "user1",
	name: "DevMaster42",
	avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=DevMaster42",
	bio: "Full-stack dev passionate about open source and retro games",
	github: "github.com/devmaster42",
	twitter: "@devmaster42",
	connections: ["user2", "user3"],
};

export const mockConnections: User[] = [
	{
		id: "user2",
		name: "CodingWizard",
		avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=CodingWizard",
		bio: "Backend engineer, Rust enthusiast, conference speaker",
		github: "github.com/codingwizard",
		twitter: "@codingwizard",
		connections: ["user1"],
	},
	{
		id: "user3",
		name: "PixelPusher",
		avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelPusher",
		bio: "UI/UX designer who codes. Creator of PixelPerfect framework.",
		github: "github.com/pixelpusher",
		twitter: "@pixelpusher",
		connections: ["user1"],
	},
];

export const mockTeams: Team[] = [
	{
		id: "team1",
		name: "ByteBusters",
		avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ByteBusters",
		description:
			"We build scalable web apps with a focus on developer experience",
		members: ["user1", "user2"],
		projects: ["proj1", "proj2"],
	},
];

export const mockProjects: Project[] = [
	{
		id: "proj1",
		name: "Code Collector",
		description: "A tool for organizing code snippets with automatic tagging",
		githubUrl: "https://github.com/bytebusters/codecollector",
		teamId: "team1",
		resources: [],
	},
	{
		id: "proj2",
		name: "DevNetwork API",
		description: "RESTful API for connecting developer networks",
		githubUrl: "https://github.com/bytebusters/devnetwork-api",
		teamId: "team1",
		resources: [],
	},
];

export const mockResources: Doc<"resources">[] = [
	{
		_id: "res1" as Id<"resources">,
		name: "How to Structure React Projects in 2023",
		description: "A comprehensive guide to organizing large React applications",
		type: "blog",
		tags: ["react", "architecture", "frontend"],
		projectId: "proj1" as Id<"projects">,
		content: {
			type: "document",
			content: "A comprehensive guide to organizing large React applications",
			format: "markdown",
			version: 1,
		},
		_creationTime: 1713331200000,
		updatedAt: 1713331200000,
		visibility: "public",
		createdBy: "user1" as Id<"users">,
		createdAt: 1713331200000,
		accessCount: 0,
	},
	{
		_id: "res2" as Id<"resources">,
		name: "github.com/solidjs/solid",
		description:
			"A declarative, efficient, and flexible JavaScript library for building user interfaces",
		type: "github",
		tags: ["javascript", "framework", "ui"],
		projectId: "proj1" as Id<"projects">,
		content: {
			type: "github",
			url: "https://github.com/solidjs/solid",
			refreshFrequency: 1440, // 1 day
			lastUpdated: 1713331200000,
		},
		_creationTime: 1713331200000,
		updatedAt: 1713331200000,
		visibility: "public",
		createdBy: "user1" as Id<"users">,
		createdAt: 1713331200000,
		accessCount: 0,
	},
	{
		_id: "res3" as Id<"resources">,
		name: "API Authentication with JWT",
		description: "Code snippet for implementing JWT auth in Node.js",
		type: "codeSnippet",
		tags: ["authentication", "nodejs", "security"],
		projectId: "proj2" as Id<"projects">,
		content: {
			type: "codeSnippet",
			code: "const jwt = require('jsonwebtoken');\n\n// ... existing code ...\n",
			language: "javascript",
			highlightOptions: {
				theme: "default",
				lineNumbers: true,
			},
		},
		_creationTime: 1713331200000,
		updatedAt: 1713331200000,
		visibility: "public",
		createdBy: "user1" as Id<"users">,
		createdAt: 1713331200000,
		accessCount: 0,
	},
];

export const mockMicroPosts: MicroPost[] = [
	{
		id: "post1",
		userId: "user1",
		content:
			"Just pushed a new update to my retro-themed react component library. Check it out!",
		tags: ["react", "ui", "retro"],
		postedAt: "2023-08-20T15:30:00Z",
		likes: ["user2"],
		comments: [
			{
				id: "comment1",
				userId: "user2",
				content: "Love the pixel perfect styling!",
				postedAt: "2023-08-20T16:15:00Z",
			},
		],
		attachedResourceId: "res1",
	},
	{
		id: "post2",
		userId: "user2",
		content:
			"Working on optimizing my Redux store structure. Any tips for handling deeply nested state?",
		tags: ["redux", "state-management", "javascript"],
		postedAt: "2023-08-19T10:45:00Z",
		likes: ["user1", "user3"],
		comments: [],
		codeSnippet: {
			code: 'const initialState = {\n  ui: {\n    theme: "dark",\n    sidebar: { open: true }\n  }\n}',
			language: "javascript",
		},
	},
	{
		id: "post3",
		userId: "user3",
		content:
			"Just finished my first Rust project! Amazing how safe and fast it feels compared to my usual stack.",
		tags: ["rust", "programming", "learning"],
		postedAt: "2023-08-18T09:12:00Z",
		likes: ["user1"],
		comments: [
			{
				id: "comment2",
				userId: "user1",
				content: "Congrats! What did you build?",
				postedAt: "2023-08-18T10:30:00Z",
			},
		],
	},
];
