<template>
  <div class="filters">
    <label for="search">Search</label>
    <input
      id="search"
      v-model="model"
      type="search"
      placeholder="Search by name, email, or mobile"
      data-testid="search"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (event: "update:modelValue", value: string): void }>();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});
</script>
