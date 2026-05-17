<script setup lang="ts">
import Game from '@/components/Game.vue'
</script>

<template>
  <div class="app-container">
    <Game />
  </div>
</template>

<style scoped lang="scss">
@use './styles';

.app-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .game-container {
    max-width: 50vh;
  }
}
</style>
