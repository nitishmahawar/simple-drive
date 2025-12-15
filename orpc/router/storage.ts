import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@/orpc";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateUploadUrl, generateDownloadUrl } from "@/lib/r2";
import { randomUUID } from "crypto";

export const storageRouter = {
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      const key = `${context.user!.id}/${randomUUID()}/${input.fileName}`;
      const url = await generateUploadUrl(key, input.contentType);

      return { url, key };
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const file = await db.query.files.findFirst({
        where: eq(files.id, input.fileId),
      });

      if (!file || file.userId !== context.user!.id) {
        throw new ORPCError("NOT_FOUND", { message: "File not found" });
      }

      const url = await generateDownloadUrl(file.storageKey);
      return { url, fileName: file.name };
    }),

  getUsage: protectedProcedure.handler(async ({ context }) => {
    const result = await db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${files.size}), 0)`,
        fileCount: sql<number>`COUNT(*)`,
      })
      .from(files)
      .where(eq(files.userId, context.user!.id));

    return {
      totalSize: Number(result[0]?.totalSize ?? 0),
      fileCount: Number(result[0]?.fileCount ?? 0),
    };
  }),
};
