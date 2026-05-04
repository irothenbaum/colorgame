<script setup lang="ts">
import {ref} from 'vue'
import TextInput from '@/components/utility/TextInput.vue'
import {COPY, CHECK} from '@/constants/icons.ts'

const props = defineProps<{
  text: string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'copy'): void
}>()

const copied = ref<boolean>(false)

function handleCopy() {
  navigator.clipboard.writeText(props.text)
  emit('copy')
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="copy-to-clipboard">
    <TextInput :model-value="text" readonly :label="label" v-tooltip.left="'unique app link'" />
    <i
      :class="{
        [copied ? CHECK : COPY]: true,
        copied: copied,
      }"
      @click="handleCopy"
      v-tooltip="copied ? 'Copied!' : 'Copy to clipboard'"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.copy-to-clipboard {
  @include styles.flex-row(var(--space-sm));

  i {
    padding: var(--space-sm);
    border: 1px solid var(--color-light-grey);
    background-color: var(--color-white);
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--font-size-md);

    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }

    &.copied {
      transition: all 0s ease;
      color: var(--color-success);
      border-color: var(--color-success);
    }
  }
}
</style>
