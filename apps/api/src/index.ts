import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({ message: "Mockdown API service" }))
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
