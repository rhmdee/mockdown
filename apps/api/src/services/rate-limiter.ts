import { Elysia } from "elysia";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: { maxRequests?: number; windowMs?: number } = {}) {
  const maxRequests = options.maxRequests ?? 60;
  const windowMs = options.windowMs ?? 60 * 1000;
  const ipStore = new Map<string, RateLimitRecord>();

  // Periodically clean expired records every minute
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, windowMs).unref?.();

  return new Elysia({ name: "rate-limiter" }).onBeforeHandle(
    { as: "global" },
    ({ request, set }) => {
      // Extract client IP address
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
      const now = Date.now();

      const record = ipStore.get(ip);
      if (!record || now > record.resetTime) {
        ipStore.set(ip, { count: 1, resetTime: now + windowMs });
        return;
      }

      if (record.count >= maxRequests) {
        set.status = 429;
        set.headers["Retry-After"] = Math.ceil((record.resetTime - now) / 1000).toString();
        return {
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`
        };
      }

      record.count += 1;
    }
  );
}
