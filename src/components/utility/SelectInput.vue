<script setup lang="ts">
import Select from 'primevue/select'

// Define props for the component
const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Array<string | {value: string; label: string}>
    label?: string
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    disabled: false,
    loading: false,
  },
)
// Define emits for two-way binding
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Select
    :model-value="modelValue"
    :options="options"
    :disabled="disabled"
    variant="filled"
    :placeholder="label"
    :loading="loading"
    @update:modelValue="value => emit('update:modelValue', value)"
  />
</template>

<style scoped lang="scss">
/* Add any custom styles if needed */
</style>
