import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerAgentRoutes } from "./routes/agents.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ status: "ok" }));

  await registerAgentRoutes(app);

  return app;
}
