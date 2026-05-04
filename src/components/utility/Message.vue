<script setup lang="ts">
import Message from 'primevue/message'
import {SECONDARY} from '@/constants/severity.ts'
import {OUTLINED_VARIANT} from '@/constants/variants.ts'

// Props definition
const props = withDefaults(
  defineProps<{
    severity?: string
    text?: string
    closable?: boolean
    icon?: string
  }>(),
  {
    severity: SECONDARY,
    closable: false,
  },
)
</script>

<template>
  <div class="message-wrapper">
    <Message :severity="severity" :text="text" :closable="closable" :icon="icon" :variant="OUTLINED_VARIANT">
      <slot></slot>
    </Message>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.message-wrapper {
  margin-bottom: var(--space-md);
  padding-top: 1px; // this is so the border can show
}
</style>
