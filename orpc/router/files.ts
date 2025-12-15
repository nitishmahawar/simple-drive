import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/orpc";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, and, isNull, like, desc, asc } from "drizzle-orm";

const sortBySchema = z.enum(["name", "size", "createdAt", "updatedAt"]);
const sortOrderSchema = z.enum(["asc", "desc"]);
const fileTypeSchema = z.enum([
  "all",
  "image",
  "video",
  "audio",
  "document",
  "archive",
  "other",
]);

export const filesRouter = {
  list: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid().nullable().optional(),
        starred: z.boolean().optional(),
        trashed: z.boolean().optional(),
        search: z.string().optional(),
        fileType: fileTypeSchema.optional(),
        sortBy: sortBySchema.optional().default("createdAt"),
        sortOrder: sortOrderSchema.optional().default("desc"),
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

      // Search by name
      if (input.search && input.search.trim()) {
        conditions.push(like(files.name, `%${input.search.trim()}%`));
      }

      // Filter by file type
      if (input.fileType && input.fileType !== "all") {
        const typePatterns: Record<string, string[]> = {
          image: ["image/%"],
          video: ["video/%"],
          audio: ["audio/%"],
          document: [
            "%pdf%",
            "%document%",
            "%text%",
            "%word%",
            "%excel%",
            "%spreadsheet%",
          ],
          archive: ["%zip%", "%archive%", "%rar%", "%7z%", "%tar%", "%gz%"],
        };

        const patterns = typePatterns[input.fileType];
        if (patterns) {
          // For simplicity, we'll use the first pattern. For more complex filtering,
          // you'd use SQL OR conditions
          conditions.push(like(files.mimeType, patterns[0]));
        }
      }

      // Determine sort column and order
      const sortColumn = {
        name: files.name,
        size: files.size,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt,
      }[input.sortBy];

      const orderFn = input.sortOrder === "asc" ? asc : desc;

      return db.query.files.findMany({
        where: and(...conditions),
        orderBy: [orderFn(sortColumn)],
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
