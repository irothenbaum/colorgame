<script setup lang="ts">
import PrimeButton from 'primevue/button'
import {ERROR} from '@/constants/severity.ts'

// Props definition
const props = withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    label?: string
    icon?: string
    type?: string // aka severity
    variant?: string
  }>(),
  {
    loading: false,
    label: 'Continue',
    disabled: false,
  },
)

// Emits definition
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <PrimeButton
    @click="emit('click')"
    :label="props.label"
    :loading="props.loading"
    :icon="props.icon"
    :disabled="props.disabled"
    :severity="props.type === ERROR ? 'danger' : props.type"
    :variant="props.variant"
  />
</template>

<style scoped lang="scss">
@use '../../styles';

button {
  @include styles.drop-shadow();
}
</style>
