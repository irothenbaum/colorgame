<script setup lang="ts">
import Controls from '@/components/Controls.vue';
import World from '@/components/World.vue';
</script>

<template>
    <div class="game">
      <World />
      <Controls />
    </div>
</template>

<style scoped lang="scss">
@use '../styles';

.game {
  @include styles.flex-column(0);
  height: 100%;
  width: 100%;
  background: black;

  .world {
    width: 100%;
    height: 100%;
    flex: 1;
  }

  .controls {
    width: 100%;
    height: 24rem;
  }
}
</style>
