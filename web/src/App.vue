<template>
  <div class="container">
    <div class="header">
      <div>
        <h1>Property Agents</h1>
        <p class="badge">PURE Home River – Take‑Home</p>
      </div>
      <button class="secondary" data-testid="clear-form" @click="resetForm">Clear form</button>
    </div>

    <div class="grid two">
      <section class="card">
        <h2>{{ isEditing ? "Update Agent" : "Create Agent" }}</h2>
        <form class="grid" data-testid="agent-form" @submit.prevent="handleSubmit">
          <div>
            <label for="firstName">First name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              placeholder="Alex"
              data-testid="first-name"
            />
          </div>
          <div>
            <label for="lastName">Last name</label>
            <input
              id="lastName"
              v-model="form.lastName"
              placeholder="Rivera"
              data-testid="last-name"
            />
          </div>
          <div>
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              placeholder="alex@purehr.com"
              data-testid="email"
            />
          </div>
          <div>
            <label for="mobile">Mobile number</label>
            <input
              id="mobile"
              v-model="form.mobileNumber"
              placeholder="(555) 123‑4567"
              data-testid="mobile-number"
            />
          </div>
          <div class="actions">
            <button class="primary" type="submit" data-testid="submit-agent">
              {{ isEditing ? "Save changes" : "Create agent" }}
            </button>
            <button
              v-if="isEditing"
              class="secondary"
              data-testid="cancel-edit"
              type="button"
              @click="resetForm"
            >
              Cancel
            </button>
          </div>
        </form>
        <div v-if="notice" class="notice" data-testid="notice">{{ notice }}</div>
      </section>

      <section class="card">
        <h2>Agents</h2>
        <div v-if="loading" data-testid="loading">Loading agents...</div>
        <div v-else-if="agents.length === 0" data-testid="empty">No agents yet.</div>
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
              <tr v-for="agent in agents" :key="agent.id" :data-testid="`agent-row-${agent.id}`">
                <td>{{ agent.firstName }} {{ agent.lastName }}</td>
                <td>{{ agent.email }}</td>
                <td>{{ agent.mobileNumber }}</td>
                <td>{{ formatDate(agent.updatedAt) }}</td>
                <td>
                  <div class="actions">
                    <button
                      class="secondary"
                      :data-testid="`edit-${agent.id}`"
                      @click="editAgent(agent)"
                    >
                      Edit
                    </button>
                    <button
                      class="danger"
                      :data-testid="`delete-${agent.id}`"
                      @click="removeAgent(agent.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

const agents = ref([]);
const loading = ref(false);
const notice = ref("");
const isEditing = ref(false);
const editingId = ref(null);

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
});

function resetForm() {
  form.firstName = "";
  form.lastName = "";
  form.email = "";
  form.mobileNumber = "";
  isEditing.value = false;
  editingId.value = null;
  notice.value = "";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

async function fetchAgents() {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE}/agents`);
    agents.value = await response.json();
  } catch (error) {
    notice.value = "Failed to load agents.";
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  notice.value = "";
  const payload = { ...form };

  try {
    const response = await fetch(
      isEditing.value ? `${API_BASE}/agents/${editingId.value}` : `${API_BASE}/agents`,
      {
        method: isEditing.value ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      notice.value = data?.error ?? "Request failed.";
      return;
    }

    await fetchAgents();
    resetForm();
  } catch (error) {
    notice.value = "Request failed.";
  }
}

function editAgent(agent) {
  form.firstName = agent.firstName;
  form.lastName = agent.lastName;
  form.email = agent.email;
  form.mobileNumber = agent.mobileNumber;
  isEditing.value = true;
  editingId.value = agent.id;
  notice.value = "Editing agent. Save changes when ready.";
}

async function removeAgent(id) {
  notice.value = "";
  try {
    const response = await fetch(`${API_BASE}/agents/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      notice.value = data?.error ?? "Delete failed.";
      return;
    }
    await fetchAgents();
  } catch (error) {
    notice.value = "Delete failed.";
  }
}

onMounted(fetchAgents);
</script>
