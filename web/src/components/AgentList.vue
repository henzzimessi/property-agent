<template>
  <section class="card">
    <div class="list-header">
      <h2>Agents</h2>
      <slot name="filters" />
    </div>
    <div v-if="loading" data-testid="loading">Loading agents...</div>
    <EmptyState v-else-if="agents.length === 0" />
    <div v-else class="table-wrap" data-testid="agents-table">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <AgentRow
            v-for="agent in agents"
            :key="agent.id"
            :agent="agent"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
          />
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Agent } from "../types/agents";
import AgentRow from "./AgentRow.vue";
import EmptyState from "./EmptyState.vue";

defineProps<{ agents: Agent[]; loading: boolean }>();
const emit = defineEmits<{
  (event: "edit", agent: Agent): void;
  (event: "delete", id: string): void;
}>();
</script>
