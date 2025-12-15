import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/orpc";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const filesRouter = {
  list: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid().nullable().optional(),
        starred: z.boolean().optional(),
        trashed: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const conditions = [eq(files.userId, context.user!.id)];

      if (input.trashed) {
        conditions.push(eq(files.isTrashed, true));
      } else {
        conditions.push(eq(files.isTrashed, false));
      }

      if (input.starred) {
        conditions.push(eq(files.isStarred, true));
      }

      if (input.folderId === null) {
        conditions.push(isNull(files.folderId));
      } else if (input.folderId) {
        conditions.push(eq(files.folderId, input.folderId));
      }

      return db.query.files.findMany({
        where: and(...conditions),
        orderBy: (files, { desc }) => [desc(files.createdAt)],
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const file = await db.query.files.findFirst({
        where: and(eq(files.id, input.id), eq(files.userId, context.user!.id)),
      });

      if (!file) {
        throw new ORPCError("NOT_FOUND", { message: "File not found" });
      }

      return file;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        folderId: z.string().uuid().nullable(),
        size: z.number(),
        mimeType: z.string(),
        storageKey: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      const [file] = await db
        .insert(files)
        .values({
          name: input.name,
          userId: context.user!.id,
          folderId: input.folderId,
          size: input.size,
          mimeType: input.mimeType,
          storageKey: input.storageKey,
        })
        .returning();

      return file;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        folderId: z.string().uuid().nullable().optional(),
        isStarred: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { id, ...updates } = input;

      const [file] = await db
        .update(files)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(files.id, id), eq(files.userId, context.user!.id)))
        .returning();

      return file;
    }),

  trash: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const [file] = await db
        .update(files)
        .set({
          isTrashed: true,
          trashedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(files.id, input.id), eq(files.userId, context.user!.id)))
        .returning();

      return file;
    }),

  restore: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const [file] = await db
        .update(files)
        .set({
          isTrashed: false,
          trashedAt: null,
          updatedAt: new Date(),
        })
        .where(and(eq(files.id, input.id), eq(files.userId, context.user!.id)))
        .returning();

      return file;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const file = await db.query.files.findFirst({
        where: and(eq(files.id, input.id), eq(files.userId, context.user!.id)),
      });

      if (!file) {
        throw new ORPCError("NOT_FOUND", { message: "File not found" });
      }

      // Delete from R2
      const { deleteObject } = await import("@/lib/r2");
      await deleteObject(file.storageKey);

      // Delete from database
      await db
        .delete(files)
        .where(and(eq(files.id, input.id), eq(files.userId, context.user!.id)));

      return { success: true };
    }),
};
