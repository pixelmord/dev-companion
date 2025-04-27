import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { convexTest } from "convex-test";
import type { Id } from "@convex-server/_generated/dataModel";
import * as ResourceModel from "@convex-server/model/resources";
import schema from "@convex-server/schema";

describe("Resource Model", () => {
  const t = convexTest(schema);
  let testUser: Id<"users">;
  let testTeam: Id<"teams">;
  let testProject: Id<"projects">;

  beforeAll(async () => {
    // Set up test user
    await t.run(async (ctx) => {
      testUser = await ctx.db.insert("users", {
        clerkId: "test:id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        lastActive: Date.now(),
        updatedAt: Date.now(),
        preferences: {
          theme: "system",
          notifications: true,
          emailDigest: true,
        },
      });

      // Create test team
      testTeam = await ctx.db.insert("teams", {
        name: "Test Team",
        visibility: "private",
        ownerId: testUser,
        settings: {
          allowInvites: true,
          defaultRole: "member",
          notificationsEnabled: true,
        },
        createdBy: testUser,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create test project
      testProject = await ctx.db.insert("projects", {
        name: "Test Project",
        description: "A test project",
        visibility: "private",
        settings: {
          notificationsEnabled: true,
          allowComments: true,
          defaultResourceVisibility: "private",
        },
        teamId: testTeam,
        createdBy: testUser,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  });

  beforeEach(async () => {
    await t.run(async (ctx) => {
      // Clear all test data
      await Promise.all([
        ctx.db.query("resources").collect().then((docs: Array<{ _id: Id<"resources"> }>) =>
          Promise.all(docs.map(doc => ctx.db.delete(doc._id)))
        ),
        ctx.db.query("resourceVersions").collect().then((docs: Array<{ _id: Id<"resourceVersions"> }>) =>
          Promise.all(docs.map(doc => ctx.db.delete(doc._id)))
        ),
        ctx.db.query("resourceShares").collect().then((docs: Array<{ _id: Id<"resourceShares"> }>) =>
          Promise.all(docs.map(doc => ctx.db.delete(doc._id)))
        ),
        ctx.db.query("resourceComments").collect().then((docs: Array<{ _id: Id<"resourceComments"> }>) =>
          Promise.all(docs.map(doc => ctx.db.delete(doc._id)))
        ),
      ]);
    });
  });

  describe("Resource Creation", () => {
    it("should create a document resource", async () => {
      const resourceData = {
        name: "Test Document",
        description: "A test document",
        type: "document" as const,
        projectId: testProject,
        visibility: "private" as const,
        content: {
          type: "document" as const,
          content: "Test content",
          format: "markdown",
          version: 1,
        },
      };

      await t.run(async (ctx) => {
        const resourceId = await ResourceModel.createResource(ctx, resourceData);
        const resource = await ctx.db.get(resourceId);

        expect(resource).toBeDefined();
        expect(resource?.name).toBe(resourceData.name);
        expect(resource?.type).toBe(resourceData.type);
        expect(resource?.content).toMatchObject(resourceData.content);
      });
    });

    it("should fail to create resource with invalid project", async () => {
      const invalidProjectId = "projects:invalid" as Id<"projects">;
      const resourceData = {
        name: "Test Document",
        type: "document" as const,
        projectId: invalidProjectId,
        visibility: "private" as const,
        content: {
          type: "document" as const,
          content: "Test content",
          format: "markdown",
          version: 1,
        },
      };

      await expect(
        t.run(async (ctx) => {
          await ResourceModel.createResource(ctx, resourceData);
        })
      ).rejects.toThrow("Project not found");
    });
  });

  describe("Resource Updates", () => {
    let testResource: Id<"resources">;

    beforeEach(async () => {
      await t.run(async (ctx) => {
        testResource = await ResourceModel.createResource(ctx, {
          name: "Original Name",
          type: "document" as const,
          projectId: testProject,
          visibility: "private" as const,
          content: {
            type: "document" as const,
            content: "Original content",
            format: "markdown",
            version: 1,
          },
        });
      });
    });

    it("should update resource fields", async () => {
      const updates = {
        name: "Updated Name",
        description: "Updated description",
      };

      await t.run(async (ctx) => {
        await ResourceModel.updateResource(ctx, testResource, updates);
        const resource = await ctx.db.get(testResource);

        expect(resource?.name).toBe(updates.name);
        expect(resource?.description).toBe(updates.description);
      });
    });

    it("should create version when content is updated", async () => {
      const updates = {
        content: {
          type: "document" as const,
          content: "Updated content",
          format: "markdown",
          version: 2,
        },
      };

      await t.run(async (ctx) => {
        await ResourceModel.updateResource(ctx, testResource, updates, "Updated content");

        const versions = await ctx.db
          .query("resourceVersions")
          .withIndex("by_resource", (q) => q.eq("resourceId", testResource))
          .collect();

        expect(versions).toHaveLength(1);
        expect(versions[0].content).toMatchObject(updates.content);
      });
    });
  });

  describe("Resource Querying", () => {
    beforeEach(async () => {
      // Create test resources
      t.run(async (ctx) => {
        await ResourceModel.createResource(ctx, {
        name: "Doc 1",
        type: "document" as const,
        projectId: testProject,
        visibility: "public" as const,
        content: {
          type: "document" as const,
          content: "Content 1",
          format: "markdown",
          version: 1,
          },
        });
        await ResourceModel.createResource(ctx, {
          name: "Code 1",
          type: "codeSnippet" as const,
          projectId: testProject,
          visibility: "public" as const,
          content: {
            type: "codeSnippet" as const,
            code: "console.log('test')",
            language: "typescript",
          },
        });
      });


    });

    it("should get resources by project", async () => {
      const resources = await t.run(async (ctx) => ResourceModel.getResourcesByProject(ctx, testProject));
      expect(resources).toHaveLength(2);
    });

    it("should get resources by type", async () => {
      const documents = await t.run(async (ctx) => ResourceModel.getResourcesByType(ctx, testProject, "document"));
      const codeSnippets = await t.run(async (ctx) => ResourceModel.getResourcesByType(ctx, testProject, "codeSnippet"));

      expect(documents).toHaveLength(1);
      expect(codeSnippets).toHaveLength(1);
    });

    it("should search resources", async () => {
      const results = await t.run(async (ctx) => ResourceModel.searchResources(ctx, {
        searchTerm: "Doc",
        projectId: testProject,
      }));

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Doc 1");
    });
  });

  describe("Resource Sharing", () => {
    let testResource: Id<"resources">;

    beforeEach(async () => {
      testResource = await t.run(async (ctx) => {
         return ResourceModel.createResource(ctx, {
          name: "Shared Resource",
          type: "document" as const,
          projectId: testProject,
          visibility: "private" as const,
          content: {
            type: "document" as const,
            content: "Content to share",
            format: "markdown",
            version: 1,
          },
        });
      });
    });

    it("should create share link", async () => {
      await t.run(async (ctx) => {
        const { shareId, accessCode } = await ResourceModel.createShareLink(
          ctx,
          testResource,
          ["view", "comment"]
        );

        const share = await ctx.db.get(shareId);
        expect(share).toBeDefined();
        expect(share?.permissions).toContain("view");
        expect(share?.permissions).toContain("comment");
        expect((share?.sharedWith as any).accessCode).toBe(accessCode);
      });
    });

    it("should share with user", async () => {
      await t.run(async (ctx) => {
        const shareId = await ResourceModel.shareWithTarget(
          ctx,
          testResource,
          { type: "user", userId: testUser },
          ["view", "edit"]
        );

        const share = await ctx.db.get(shareId);
        expect(share).toBeDefined();
        expect(share?.permissions).toContain("view");
        expect(share?.permissions).toContain("edit");
        expect((share?.sharedWith as any).userId).toBe(testUser);
      });
    });
  });

  describe("Resource Comments", () => {
    let testResource: Id<"resources">;

    beforeEach(async () => {
      testResource = await t.run(async (ctx) => {
        return ResourceModel.createResource(ctx, {
          name: "Resource with Comments",
          type: "document" as const,
          projectId: testProject,
          visibility: "private" as const,
          content: {
          type: "document" as const,
          content: "Content to comment on",
          format: "markdown",
          version: 1,
        },
        });
      });
    });

    it("should add comment", async () => {
      const commentId = await t.run(async (ctx) => ResourceModel.addComment(
        ctx,
        testResource,
        "Test comment"
      ));

      const comment = await t.run(async (ctx) => ctx.db.get(commentId));
      expect(comment).toBeDefined();
      expect(comment?.content).toBe("Test comment");
      expect(comment?.depth).toBe(0);
    });

    it("should add nested comment", async () => {
      const parentId = await t.run(async (ctx) => ResourceModel.addComment(
        ctx,
        testResource,
        "Parent comment"
      ));

      const childId = await t.run(async (ctx) => ResourceModel.addComment(
        ctx,
        testResource,
        "Child comment",
        parentId
      ));

      const child = await t.run(async (ctx) => ctx.db.get(childId));
      expect(child).toBeDefined();
      expect(child?.parentCommentId).toBe(parentId);
      expect(child?.depth).toBe(1);
      expect(child?.path).toContain(parentId);
    });

    it("should toggle comment resolution", async () => {
      const commentId = await t.run(async (ctx) => ResourceModel.addComment(
        ctx,
        testResource,
        "Comment to resolve"
      ));

      await t.run(async (ctx) => ResourceModel.toggleCommentResolution(ctx, commentId));

      const resolved = await t.run(async (ctx) => ctx.db.get(commentId));
      expect(resolved?.isResolved).toBe(true);
      expect(resolved?.resolvedBy).toBe(testUser);

      await t.run(async (ctx) => ResourceModel.toggleCommentResolution(ctx, commentId));

      const unresolved = await t.run(async (ctx) => ctx.db.get(commentId));
      expect(unresolved?.isResolved).toBe(false);
      expect(unresolved?.resolvedBy).toBeUndefined();
    });
  });
});