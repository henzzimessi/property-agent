<template>
  <div class="container">
    <section class="hero card">
      <div class="hero-header">
        <div>
          <h1>Property Agents</h1>
          <p class="hero-subtitle">
            Manage your regional roster with confidence — create, update, and track
            agent performance in one place.
          </p>
          <StatusBadge>PURE Home River – Take‑Home</StatusBadge>
        </div>
        <div class="hero-actions">
          <button class="secondary" type="button" @click="refreshAgents">
            Refresh list
          </button>
          <button class="secondary" data-testid="clear-form" type="button" @click="resetForm">
            Clear form
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Total agents</p>
          <p class="stat-value">{{ totalAgents }}</p>
          <p class="stat-note">{{ filteredCount }} visible with current filters</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Recently updated</p>
          <p class="stat-value">{{ recentlyUpdated }}</p>
          <p class="stat-note">Past 7 days · Latest {{ latestUpdate }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Mobile coverage</p>
          <p class="stat-value">{{ withMobile }}</p>
          <p class="stat-note">Agents with phone numbers on file</p>
        </div>
      </div>
    </section>

    <div class="grid two">
      <AgentForm
        ref="formRef"
        :initial-values="initialValues"
        :is-editing="isEditing"
        :notice="notice"
        @submit="handleSubmit"
        @cancel="resetForm"
      />

      <AgentList :agents="agents" :loading="loading" @edit="editAgent" @delete="removeAgent">
        <template #filters>
          <AgentFilters v-model="searchTerm" />
        </template>
      </AgentList>
    </div>

    <div v-if="storeError" class="notice" data-testid="notice-error">
      {{ storeError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import AgentForm from "./components/AgentForm.vue";
import AgentList from "./components/AgentList.vue";
import AgentFilters from "./components/AgentFilters.vue";
import StatusBadge from "./components/StatusBadge.vue";
import { useAgentsStore } from "./stores/agents";
import type { Agent, AgentPayload } from "./types/agents";

const store = useAgentsStore();
const { filteredAgents, loading, error, searchTerm: storeSearchTerm } = storeToRefs(store);

const formRef = ref<InstanceType<typeof AgentForm> | null>(null);
const notice = ref("");
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const emptyValues: AgentPayload = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
};

const editingAgent = computed(() =>
  store.agents.find((agent) => agent.id === editingId.value) ?? null,
);

const initialValues = computed<AgentPayload>(() => {
  if (isEditing.value && editingAgent.value) {
    const agent = editingAgent.value;
    return {
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      mobileNumber: agent.mobileNumber,
    };
  }
  return { ...emptyValues };
});

const agents = computed(() => filteredAgents.value);
const storeError = computed(() => error.value);
const totalAgents = computed(() => store.agents.length);
const filteredCount = computed(() => agents.value.length);
const withMobile = computed(
  () => store.agents.filter((agent) => agent.mobileNumber.trim().length > 0).length,
);
const recentlyUpdated = computed(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return store.agents.filter((agent) => {
    const timestamp = new Date(agent.updatedAt).getTime();
    return !Number.isNaN(timestamp) && timestamp >= cutoff;
  }).length;
});
const latestUpdate = computed(() => {
  const timestamps = store.agents
    .map((agent) => new Date(agent.updatedAt).getTime())
    .filter((value) => !Number.isNaN(value));
  if (timestamps.length === 0) return "—";
  return new Date(Math.max(...timestamps)).toLocaleDateString();
});

const searchTerm = computed({
  get: () => storeSearchTerm.value,
  set: (value: string) => store.setSearchTerm(value),
});

const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  notice.value = "";
  formRef.value?.resetForm();
};

const refreshAgents = () => {
  store.fetchAgents();
};

const handleSubmit = async (payload: AgentPayload) => {
  notice.value = "";

  const result = isEditing.value && editingId.value
    ? await store.updateAgent(editingId.value, payload)
    : await store.createAgent(payload);

  if (!result.ok) {
    notice.value = result.error;
    return;
  }

  notice.value = isEditing.value ? "Agent updated." : "Agent created.";
  isEditing.value = false;
  editingId.value = null;
  formRef.value?.resetForm();
};

const editAgent = (agent: Agent) => {
  isEditing.value = true;
  editingId.value = agent.id;
  notice.value = "Editing agent. Save changes when ready.";
};

const removeAgent = async (id: string) => {
  notice.value = "";
  const result = await store.deleteAgent(id);
  if (!result.ok) {
    notice.value = result.error;
  }
};

onMounted(() => {
  store.fetchAgents();
});
</script>
