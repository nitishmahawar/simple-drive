import { os, ORPCError } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  createRatelimitMiddleware,
  Ratelimiter,
} from "@orpc/experimental-ratelimit";
import { User } from "better-auth";

interface Context {
  user?: User;
  ratelimiter?: Ratelimiter;
}

const rateLimitMiddleware = createRatelimitMiddleware({
  limiter: ({ context }) => context.ratelimiter,
  key: ({ context, path }) =>
    context.user?.id || (context as any).ip || `global:${path}`, // Fallback to IP or global if needed
});

export const publicProcedure = os.$context<Context>().use(rateLimitMiddleware);

export const protectedProcedure = publicProcedure.use(
  async ({ context, next }) => {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You must be logged in",
      });
    }

    return next({
      context: {
        ...context,
        user: session.user,
      },
    });
  }
);
