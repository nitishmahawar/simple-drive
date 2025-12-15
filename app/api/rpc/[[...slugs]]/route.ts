import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { router } from "@/orpc/router";
import { RatelimitHandlerPlugin } from "@orpc/experimental-ratelimit";
import { ratelimiter } from "@/lib/rate-limit";

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error("oRPC Error:", error);
    }),
  ],
  plugins: [new RatelimitHandlerPlugin()],
});

const handleRequest = async (request: Request) => {
  // Get IP from headers (simple approximation for example)
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      ratelimiter,
      ip,
    },
  });

  return response ?? new Response("Not found", { status: 404 });
};

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
