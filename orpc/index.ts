import { os, ORPCError } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

interface Context {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export const publicProcedure = os.$context<Context>();

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
