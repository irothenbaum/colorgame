<script setup lang="ts">
import {CLOSE} from '@/constants/icons.ts'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition name="modal-overlay">
    <div v-if="show" class="modal-overlay" @click="emit('close')" />
  </Transition>
  <Transition name="modal-content">
    <div v-if="show" class="modal-content" @click.stop>
      <button class="close-btn" @click="emit('close')"><i :class="CLOSE" /></button>
      <slot />
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '../../styles';

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-white);
  opacity: 0.9;
  z-index: 100;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-white);
  border: none;
  box-shadow: 0 0 20px 20px var(--color-white);
  color: var(--color-near-black);
  padding: var(--space-xl);
  @include styles.flex-column(var(--space-md));
  width: min(340px, 90vw);
  text-align: center;
  z-index: 101;

  .close-btn {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    border: 0;
    background: none;
    box-shadow: none;
    color: var(--color-near-black);
    font-size: var(--font-size-lg);
    opacity: 0.5;
    cursor: pointer;
  }
}

.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.5s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-overlay-enter-to,
.modal-overlay-leave-from {
  opacity: 0.9;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 50px));
}

.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}
</style>
