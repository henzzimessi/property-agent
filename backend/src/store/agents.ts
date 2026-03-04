import type { Agent } from "../types.js";

const agents = new Map<string, Agent>();

export const agentStore = {
  list(): Agent[] {
    return Array.from(agents.values());
  },
  get(id: string): Agent | undefined {
    return agents.get(id);
  },
  create(agent: Agent): Agent {
    agents.set(agent.id, agent);
    return agent;
  },
  update(id: string, partial: Omit<Agent, "id" | "createdAt">): Agent | undefined {
    const existing = agents.get(id);
    if (!existing) return undefined;
    const updated: Agent = {
      ...existing,
      ...partial,
      id,
      createdAt: existing.createdAt,
    };
    agents.set(id, updated);
    return updated;
  },
  remove(id: string): boolean {
    return agents.delete(id);
  },
  existsByEmail(email: string, excludeId?: string): boolean {
    for (const agent of agents.values()) {
      if (agent.email.toLowerCase() === email.toLowerCase() && agent.id !== excludeId) {
        return true;
      }
    }
    return false;
  },
};
