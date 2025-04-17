import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Sentry from "@sentry/browser";
import type { Doc, Id } from "./_generated/dataModel";

// Helper function to get the current user or throw if not authenticated
async function getUserOrThrow(ctx: {
  auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string, subject: string } | null> };
  db: any;
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export const documentsTables = {
  documents: defineTable({
    // Basic document info
    title: v.string(),
    content: v.string(),
    description: v.optional(v.string()),

    // Ownership and access
    ownerId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    isPublic: v.boolean(),
    sharedWith: v.optional(v.array(v.id("users"))),

    // Metadata
    tags: v.optional(v.array(v.string())),

    // Audit fields
    lastEditedBy: v.id("users"),
    lastEditedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_team", ["teamId"])
    .index("by_public", ["isPublic"]),

  documentVersions: defineTable({
    documentId: v.id("documents"),
    versionNumber: v.number(),
    content: v.string(),
    title: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),
    description: v.optional(v.string()),
  })
    .index("by_document", ["documentId"])
    .index("by_document_and_version", ["documentId", "versionNumber"]),
};

// Query to list documents for a user
export const listDocuments = query({
  args: {
    teamId: v.optional(v.id("teams")),
    ownerId: v.optional(v.id("users")),
    includePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Doc<"documents">[]> => {
    return Sentry.startSpan({ name: "Listing documents" }, async () => {
      const user = await getUserOrThrow(ctx);

      // Build the query
      let documents: Doc<"documents">[] = [];

      // Documents owned by the user
      const userDocuments = await ctx.db
        .query("documents")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();
      documents = [...documents, ...userDocuments];

      // Team documents if requested
      if (args.teamId) {
        // TODO: Check team membership
        const teamDocuments = await ctx.db
          .query("documents")
          .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
          .collect();

        // Add team documents not already in the list
        for (const doc of teamDocuments) {
          if (!documents.some(d => d._id === doc._id)) {
            documents.push(doc);
          }
        }
      }

      // Public documents if requested
      if (args.includePublic) {
        const publicDocuments = await ctx.db
          .query("documents")
          .withIndex("by_public", (q) => q.eq("isPublic", true))
          .collect();

        // Add public documents not already in the list
        for (const doc of publicDocuments) {
          if (!documents.some(d => d._id === doc._id)) {
            documents.push(doc);
          }
        }
      }

      // Documents owned by specific user if requested
      if (args.ownerId) {
        const userOwnedDocuments = await ctx.db
          .query("documents")
          .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId as Id<"users">))
          .collect();

        // Filter to only public documents or documents shared with the current user
        const filteredUserDocs = userOwnedDocuments.filter(doc =>
          doc.isPublic ||
          doc.sharedWith?.includes(user._id) ||
          doc.ownerId === user._id
        );

        // Add these documents if not already in the list
        for (const doc of filteredUserDocs) {
          if (!documents.some(d => d._id === doc._id)) {
            documents.push(doc);
          }
        }
      }

      return documents;
    });
  },
});

// Query to get a specific document
export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args): Promise<Doc<"documents"> | null> => {
    return Sentry.startSpan({ name: "Fetching document" }, async () => {
      const user = await getUserOrThrow(ctx);
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        return null;
      }

      // Check access permissions
      if (
        document.ownerId === user._id ||
        document.isPublic ||
        document.sharedWith?.includes(user._id)
      ) {
        return document;
      }

      // TODO: Check team membership if document belongs to a team
      if (document.teamId) {
        // For now, return the document if it has a team
        // In a real app, you'd check team membership
        return document;
      }

      // User doesn't have access
      throw new Error("You don't have access to this document");
    });
  },
});

// Query to get document versions
export const getDocumentVersions = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args): Promise<Doc<"documentVersions">[]> => {
    return Sentry.startSpan({ name: "Fetching document versions" }, async () => {
      const user = await getUserOrThrow(ctx);
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check access permissions
      if (
        document.ownerId !== user._id &&
        !document.isPublic &&
        !document.sharedWith?.includes(user._id)
      ) {
        throw new Error("You don't have access to this document");
      }

      // Fetch all versions of this document
      const versions = await ctx.db
        .query("documentVersions")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .order("desc")
        .collect();

      return versions;
    });
  },
});

// Query to get a specific document version
export const getDocumentVersion = query({
  args: {
    documentId: v.id("documents"),
    versionNumber: v.number(),
  },
  handler: async (ctx, args): Promise<Doc<"documentVersions"> | null> => {
    return Sentry.startSpan({ name: "Fetching specific document version" }, async () => {
      const user = await getUserOrThrow(ctx);
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check access permissions
      if (
        document.ownerId !== user._id &&
        !document.isPublic &&
        !document.sharedWith?.includes(user._id)
      ) {
        throw new Error("You don't have access to this document");
      }

      // Fetch the specific version
      const version = await ctx.db
        .query("documentVersions")
        .withIndex("by_document_and_version", (q) =>
          q
            .eq("documentId", args.documentId)
            .eq("versionNumber", args.versionNumber)
        )
        .first();

      return version;
    });
  },
});

// Mutation to create a new document
export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    description: v.optional(v.string()),
    teamId: v.optional(v.id("teams")),
    isPublic: v.optional(v.boolean()),
    sharedWith: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    return Sentry.startSpan({ name: "Creating document" }, async () => {
      const user = await getUserOrThrow(ctx);
      const timestamp = Date.now();

      // Create the document
      const documentId = await ctx.db.insert("documents", {
        title: args.title,
        content: args.content,
        description: args.description,
        ownerId: user._id,
        teamId: args.teamId,
        isPublic: args.isPublic ?? false,
        sharedWith: args.sharedWith ?? [],
        tags: args.tags ?? [],
        lastEditedBy: user._id,
        lastEditedAt: timestamp,
      });

      // Create the initial version
      await ctx.db.insert("documentVersions", {
        documentId,
        versionNumber: 1,
        content: args.content,
        title: args.title,
        description: args.description,
        createdAt: timestamp,
        createdBy: user._id,
      });

      return documentId;
    });
  },
});

// Mutation to update a document
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    sharedWith: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.string())),
    createVersion: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    return Sentry.startSpan({ name: "Updating document" }, async () => {
      const user = await getUserOrThrow(ctx);
      const timestamp = Date.now();

      // Get the current document
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check if user has edit permission
      if (document.ownerId !== user._id) {
        // TODO: Check team permissions if it's a team document
        throw new Error("You don't have permission to edit this document");
      }

      // Prepare update object
      const updates: Partial<Doc<"documents">> = {
        lastEditedBy: user._id,
        lastEditedAt: timestamp,
      };

      if (args.title !== undefined) updates.title = args.title;
      if (args.content !== undefined) updates.content = args.content;
      if (args.description !== undefined) updates.description = args.description;
      if (args.isPublic !== undefined) updates.isPublic = args.isPublic;
      if (args.sharedWith !== undefined) updates.sharedWith = args.sharedWith;
      if (args.tags !== undefined) updates.tags = args.tags;

      // Update the document
      await ctx.db.patch(args.documentId, updates);

      // Create a new version if requested and content has changed
      if (args.createVersion && (args.content !== undefined || args.title !== undefined)) {
        // Get the latest version number
        const latestVersion = await ctx.db
          .query("documentVersions")
          .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
          .order("desc")
          .first();

        const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        // Create a new version
        await ctx.db.insert("documentVersions", {
          documentId: args.documentId,
          versionNumber: newVersionNumber,
          content: args.content ?? document.content,
          title: args.title ?? document.title,
          description: args.description ?? document.description,
          createdAt: timestamp,
          createdBy: user._id,
        });
      }

      return args.documentId;
    });
  },
});

// Mutation to delete a document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    return Sentry.startSpan({ name: "Deleting document" }, async () => {
      const user = await getUserOrThrow(ctx);

      // Get the document
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check if user has delete permission
      if (document.ownerId !== user._id) {
        // TODO: Check team admin permissions
        throw new Error("You don't have permission to delete this document");
      }

      // Delete all versions first
      const versions = await ctx.db
        .query("documentVersions")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .collect();

      for (const version of versions) {
        await ctx.db.delete(version._id);
      }

      // Delete the document
      await ctx.db.delete(args.documentId);

      return true;
    });
  },
});

export const restoreDocumentVersion = mutation({
  args: {
    documentId: v.id("documents"),
    versionNumber: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    return Sentry.startSpan({ name: "Restoring document version" }, async () => {
      const user = await getUserOrThrow(ctx);
      const timestamp = Date.now();

      // Get the document
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check if user has edit permission
      if (document.ownerId !== user._id) {
        throw new Error("You don't have permission to edit this document");
      }

      // Get the version to restore
      const versionToRestore = await ctx.db
        .query("documentVersions")
        .withIndex("by_document_and_version", (q) =>
          q
            .eq("documentId", args.documentId)
            .eq("versionNumber", args.versionNumber)
        )
        .first();

      if (!versionToRestore) {
        throw new Error("Version not found");
      }

      // Update the document with the version content
      await ctx.db.patch(args.documentId, {
        content: versionToRestore.content,
        title: versionToRestore.title,
        description: versionToRestore.description,
        lastEditedBy: user._id,
        lastEditedAt: timestamp,
      });

      // Create a new version to record this restore
      const latestVersion = await ctx.db
        .query("documentVersions")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .order("desc")
        .first();

      const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      await ctx.db.insert("documentVersions", {
        documentId: args.documentId,
        versionNumber: newVersionNumber,
        content: versionToRestore.content,
        title: versionToRestore.title,
        description: versionToRestore.description,
        createdAt: timestamp,
        createdBy: user._id,
      });

      return args.documentId;
    });
  },
});

export const shareDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    return Sentry.startSpan({ name: "Sharing document" }, async () => {
      const user = await getUserOrThrow(ctx);

      // Get the document
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check if user has share permission
      if (document.ownerId !== user._id) {
        throw new Error("You don't have permission to share this document");
      }

      // Update the shared users list
      const currentSharedWith = document.sharedWith || [];
      const newSharedWith = [...new Set([...currentSharedWith, ...args.userIds])];

      await ctx.db.patch(args.documentId, {
        sharedWith: newSharedWith,
      });

      return args.documentId;
    });
  },
});

export const unshareDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    return Sentry.startSpan({ name: "Unsharing document" }, async () => {
      const user = await getUserOrThrow(ctx);

      // Get the document
      const document = await ctx.db.get(args.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Check if user has share permission
      if (document.ownerId !== user._id) {
        throw new Error("You don't have permission to unshare this document");
      }

      // Remove the user from shared list
      const currentSharedWith = document.sharedWith || [];
      const newSharedWith = currentSharedWith.filter(id => id !== args.userId);

      await ctx.db.patch(args.documentId, {
        sharedWith: newSharedWith,
      });

      return args.documentId;
    });
  },
});