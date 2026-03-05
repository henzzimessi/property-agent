import { defineStore } from "pinia";
import type { Agent, AgentPayload } from "../types/agents";
import * as agentsApi from "../api/agents";

interface AgentsState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useAgentsStore = defineStore("agents", {
  state: (): AgentsState => ({
    agents: [],
    loading: false,
    error: null,
    searchTerm: "",
  }),
  getters: {
    filteredAgents: (state) => {
      const term = state.searchTerm.trim().toLowerCase();
      if (!term) return state.agents;
      return state.agents.filter((agent) => {
        const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
        return (
          fullName.includes(term) ||
          agent.email.toLowerCase().includes(term) ||
          agent.mobileNumber.toLowerCase().includes(term)
        );
      });
    },
  },
  actions: {
    setSearchTerm(value: string) {
      this.searchTerm = value;
    },
    async fetchAgents() {
      this.loading = true;
      this.error = null;
      try {
        this.agents = await agentsApi.fetchAgents();
      } catch (error) {
        this.error = getErrorMessage(error, "Failed to load agents.");
      } finally {
        this.loading = false;
      }
    },
    async createAgent(payload: AgentPayload) {
      try {
        await agentsApi.createAgent(payload);
        await this.fetchAgents();
        return { ok: true } as const;
      } catch (error) {
        return {
          ok: false,
          error: getErrorMessage(error, "Request failed."),
        } as const;
      }
    },
    async updateAgent(id: string, payload: AgentPayload) {
      try {
        await agentsApi.updateAgent(id, payload);
        await this.fetchAgents();
        return { ok: true } as const;
      } catch (error) {
        return {
          ok: false,
          error: getErrorMessage(error, "Request failed."),
        } as const;
      }
    },
    async deleteAgent(id: string) {
      try {
        await agentsApi.deleteAgent(id);
        await this.fetchAgents();
        return { ok: true } as const;
      } catch (error) {
        return {
          ok: false,
          error: getErrorMessage(error, "Delete failed."),
        } as const;
      }
    },
  },
});
