<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'

// Props definition
const props = withDefaults(
  defineProps<{
    height?: number | string
    width?: number | string
  }>(),
  {
    height: 50,
    width: 50,
  },
)

function numberToPx(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}
</script>

<template>
  <span class="spinner">
    <ProgressSpinner
      :style="{width: numberToPx(width), height: numberToPx(height)}"
      strokeWidth="8"
      fill="transparent"
      animationDuration=".5s"
      aria-label="Loading data"
    />
  </span>
</template>

<style scoped lang="scss">
@use '../../styles';

.spinner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
