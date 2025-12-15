import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/orpc";
import { db } from "@/db";
import { folders, files } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const foldersRouter = {
  list: protectedProcedure
    .input(
      z.object({
        parentId: z.string().uuid().nullable().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const conditions = [eq(folders.userId, context.user!.id)];

      if (input.parentId === null) {
        conditions.push(isNull(folders.parentId));
      } else if (input.parentId) {
        conditions.push(eq(folders.parentId, input.parentId));
      }

      return db.query.folders.findMany({
        where: and(...conditions),
        orderBy: (folders, { asc }) => [asc(folders.name)],
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const folder = await db.query.folders.findFirst({
        where: and(
          eq(folders.id, input.id),
          eq(folders.userId, context.user!.id)
        ),
      });

      if (!folder) {
        throw new ORPCError("NOT_FOUND", { message: "Folder not found" });
      }

      // Build breadcrumb path
      const path: Array<{ id: string; name: string }> = [];
      let currentFolder = folder;

      while (currentFolder) {
        path.unshift({ id: currentFolder.id, name: currentFolder.name });

        if (currentFolder.parentId) {
          const parent = await db.query.folders.findFirst({
            where: eq(folders.id, currentFolder.parentId),
          });
          currentFolder = parent as typeof folder;
        } else {
          break;
        }
      }

      return { ...folder, path };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.string().uuid().nullable(),
      })
    )
    .handler(async ({ input, context }) => {
      const [folder] = await db
        .insert(folders)
        .values({
          name: input.name,
          userId: context.user!.id,
          parentId: input.parentId,
        })
        .returning();

      return folder;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        parentId: z.string().uuid().nullable().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { id, ...updates } = input;

      const [folder] = await db
        .update(folders)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(folders.id, id), eq(folders.userId, context.user!.id)))
        .returning();

      return folder;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      // Delete all files in folder from R2
      const folderFiles = await db.query.files.findMany({
        where: and(
          eq(files.folderId, input.id),
          eq(files.userId, context.user!.id)
        ),
      });

      const { deleteObject } = await import("@/lib/r2");
      for (const file of folderFiles) {
        await deleteObject(file.storageKey);
      }

      // Delete folder (cascade will handle files in DB)
      await db
        .delete(folders)
        .where(
          and(eq(folders.id, input.id), eq(folders.userId, context.user!.id))
        );

      return { success: true };
    }),
};
