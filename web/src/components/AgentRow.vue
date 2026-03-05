<template>
  <tr :data-testid="`agent-row-${agent.id}`">
    <td>{{ agent.firstName }} {{ agent.lastName }}</td>
    <td>{{ agent.email }}</td>
    <td>{{ agent.mobileNumber }}</td>
    <td>{{ formattedUpdatedAt }}</td>
    <td>
      <div class="actions">
        <button class="secondary" :data-testid="`edit-${agent.id}`" @click="onEdit">
          Edit
        </button>
        <button class="danger" :data-testid="`delete-${agent.id}`" @click="onDelete">
          Delete
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Agent } from "../types/agents";

const props = defineProps<{ agent: Agent }>();
const emit = defineEmits<{
  (event: "edit", agent: Agent): void;
  (event: "delete", id: string): void;
}>();

const formattedUpdatedAt = computed(() => {
  if (!props.agent.updatedAt) return "—";
  return new Date(props.agent.updatedAt).toLocaleString();
});

const onEdit = () => emit("edit", props.agent);
const onDelete = () => emit("delete", props.agent.id);
</script>
