<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore'

const gameStore = useGameStore()
</script>

<template>
  <div class="pause-overlay">
    <div class="pause-modal">
      <h1>Paused</h1>
      <div class="pause-actions">
        <button class="btn btn-primary" @click="gameStore.togglePause(false)">Resume</button>
        <button class="btn btn-secondary" @click="gameStore.endGame()">Quit</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.pause-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  @include styles.flex-column();
  justify-content: center;
  z-index: 100;
}

.pause-modal {
  background: var(--color-near-white);
  color: var(--color-near-black);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
  @include styles.flex-column(var(--space-lg));
  @include styles.drop-shadow(12px, 0.4);
  width: min(320px, 90vw);

  h1 {
    font-size: var(--font-size-xxl);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
}

.pause-actions {
  @include styles.flex-row(var(--space-md));
  width: 100%;
}

.btn {
  flex: 1;
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-family: inherit;
  font-size: var(--font-size-lg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  @include styles.drop-shadow();

  &.btn-primary {
    background: var(--color-near-black);
    color: var(--color-near-white);
  }

  &.btn-secondary {
    background: var(--color-light-grey);
    color: var(--color-near-black);
  }
}
</style>
