import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { Router } from "./router";

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      return "http://localhost:3000/api/rpc";
    }
    return `${window.location.origin}/api/rpc`;
  },
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }
    const { headers } = await import("next/headers");
    const headersList = await headers();
    return Object.fromEntries(headersList.entries());
  },
});

export const client: RouterClient<Router> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
