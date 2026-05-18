<script setup lang="ts">
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'

const menuStore = useMenuStore()

function handleStart() {
  menuStore.goToScene(Scene.TRAINING)
}
</script>

<template>
  <div class="menu">
    <h3>Training</h3>
    <p>Practice your aim against a single target with no time pressure.</p>
    <button @click="handleStart">Start</button>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.menu {
  @include styles.level-card();

  h3 {
    font-size: var(--font-size-xl);
  }

  p {
    font-style: italic;
    margin-top: var(--space-sm);
    opacity: 0.6;
  }

  button {
    margin-top: var(--space-lg);
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-size-xl);
    border: 0;
    border-radius: var(--border-radius-md);
    background: var(--color-text);
    color: var(--color-white);
    @include styles.drop-shadow();
  }
}
</style>
