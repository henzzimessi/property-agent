<template>
  <section class="card">
    <h2>{{ isEditing ? "Update Agent" : "Create Agent" }}</h2>
    <form class="grid" data-testid="agent-form" @submit.prevent="onSubmit">
      <div>
        <label for="firstName">First name</label>
        <input
          id="firstName"
          v-model="form.firstName"
          placeholder="Alex"
          data-testid="first-name"
          :aria-invalid="Boolean(errors.firstName)"
        />
        <small v-if="errors.firstName" class="field-error">{{ errors.firstName }}</small>
      </div>
      <div>
        <label for="lastName">Last name</label>
        <input
          id="lastName"
          v-model="form.lastName"
          placeholder="Rivera"
          data-testid="last-name"
          :aria-invalid="Boolean(errors.lastName)"
        />
        <small v-if="errors.lastName" class="field-error">{{ errors.lastName }}</small>
      </div>
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          placeholder="alex@purehr.com"
          data-testid="email"
          :aria-invalid="Boolean(errors.email)"
        />
        <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
      </div>
      <div>
        <label for="mobile">Mobile number</label>
        <input
          id="mobile"
          v-model="form.mobileNumber"
          placeholder="(555) 123‑4567"
          data-testid="mobile-number"
          :aria-invalid="Boolean(errors.mobileNumber)"
        />
        <small v-if="errors.mobileNumber" class="field-error">
          {{ errors.mobileNumber }}
        </small>
      </div>
      <div class="actions">
        <button
          class="primary"
          type="button"
          data-testid="submit-agent"
          @click="onSubmit"
        >
          {{ isEditing ? "Save changes" : "Create agent" }}
        </button>
        <button
          v-if="isEditing"
          class="secondary"
          data-testid="cancel-edit"
          type="button"
          @click="emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </form>
    <div v-if="notice" class="notice" data-testid="notice">{{ notice }}</div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { z } from "zod";
import type { AgentPayload } from "../types/agents";

const props = defineProps<{ initialValues: AgentPayload; isEditing: boolean; notice: string }>();
const emit = defineEmits<{
  (event: "submit", payload: AgentPayload): void;
  (event: "cancel"): void;
}>();

const schema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  email: z.string().email("Enter a valid email."),
  mobileNumber: z
    .string()
    .min(7, "Enter a valid mobile number.")
    .regex(/[0-9]/, "Enter a valid mobile number."),
});

const form = reactive<AgentPayload>({ ...props.initialValues });
const errors = reactive<Record<keyof AgentPayload, string>>({
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
});

const clearErrors = () => {
  errors.firstName = "";
  errors.lastName = "";
  errors.email = "";
  errors.mobileNumber = "";
};

const validateForm = () => {
  clearErrors();
  const result = schema.safeParse(form);
  if (result.success) {
    return true;
  }
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in errors) {
      const key = field as keyof AgentPayload;
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }
  }
  return false;
};

const onSubmit = () => {
  if (!validateForm()) {
    return;
  }
  emit("submit", { ...form });
};

const reset = () => {
  Object.assign(form, props.initialValues);
  clearErrors();
};

watch(
  () => props.initialValues,
  (value) => {
    Object.assign(form, value);
    clearErrors();
  },
  { deep: true },
);

let validationTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  form,
  () => {
    if (validationTimer) {
      clearTimeout(validationTimer);
    }

    const hasInput = Object.values(form).some((value) => value.trim().length > 0);
    if (!hasInput) {
      clearErrors();
      return;
    }

    validationTimer = setTimeout(() => {
      validateForm();
    }, 150);
  },
  { deep: true },
);

defineExpose({ resetForm: reset });
</script>
