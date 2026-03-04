import { z } from "zod";
import { randomUUID } from "node:crypto";
import { agentStore } from "../store/agents.js";
import type { Agent } from "../types.js";
import type { FastifyInstance } from "fastify";

const agentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  mobileNumber: z.string().min(7),
});

const agentUpdateSchema = agentSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

function nowIso() {
  return new Date().toISOString();
}

function buildAgent(id: string, data: z.infer<typeof agentSchema>): Agent {
  const timestamp = nowIso();
  return {
    id,
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function registerAgentRoutes(app: FastifyInstance) {
  app.get("/agents", async () => {
    return agentStore.list();
  });

  app.get<{ Params: { id: string } }>("/agents/:id", async (request, reply) => {
    const agent = agentStore.get(request.params.id);
    if (!agent) {
      return reply.status(404).send({ error: "Agent not found" });
    }
    return agent;
  });

  app.post<{ Body: z.infer<typeof agentSchema> }>("/agents", async (request, reply) => {
    const parsed = agentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }
    if (agentStore.existsByEmail(parsed.data.email)) {
      return reply.status(409).send({ error: "Email already exists" });
    }

    const agent = buildAgent(randomUUID(), parsed.data);
    agentStore.create(agent);
    return reply.status(201).send(agent);
  });

  app.put<{ Params: { id: string }; Body: z.infer<typeof agentUpdateSchema> }>(
    "/agents/:id",
    async (request, reply) => {
      const parsed = agentUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
      }

      if (parsed.data.email && agentStore.existsByEmail(parsed.data.email, request.params.id)) {
        return reply.status(409).send({ error: "Email already exists" });
      }

      const updated = agentStore.update(request.params.id, {
        ...parsed.data,
        updatedAt: nowIso(),
      } as Omit<Agent, "id" | "createdAt">);

      if (!updated) {
        return reply.status(404).send({ error: "Agent not found" });
      }

      return updated;
    },
  );

  app.delete<{ Params: { id: string } }>("/agents/:id", async (request, reply) => {
    const removed = agentStore.remove(request.params.id);
    if (!removed) {
      return reply.status(404).send({ error: "Agent not found" });
    }
    return reply.status(204).send();
  });
}
