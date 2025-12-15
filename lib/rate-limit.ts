import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";

export const ratelimiter = new MemoryRatelimiter({
  maxRequests: 10,
  window: 60000, // 1 minute
});
