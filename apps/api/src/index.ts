import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createRateLimiter } from "./services/rate-limiter";
import { deployRoutes } from "./routes/deploy";
import { mockRoutes } from "./routes/mock";

export const app = new Elysia()
  .use(cors())
  .use(createRateLimiter({ maxRequests: 100, windowMs: 60 * 1000 }))
  .get("/", () => ({
    name: "Mockdown API",
    status: "online",
    version: "1.0.0"
  }))
  .use(deployRoutes)
  .use(mockRoutes);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🦊 Elysia is running at http://localhost:${PORT}`);
  });
}

export type App = typeof app;
