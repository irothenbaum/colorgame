<script setup lang="ts">
import Controls from './controls/Controls.vue';
import World from './world/World.vue';
import {useGameStore} from '@/stores/gameStore.ts'
import {storeToRefs} from 'pinia'

const gameStore = useGameStore()
const {currentLevel} = storeToRefs(gameStore)
</script>

<template>
  <div class="play-level">
    <World />
    <Controls />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.play-level {
  @include styles.flex-column(0);
  height: 100%;
  width: 100%;
  container-type: inline-size;
  background: black;

  .world {
    width: 100%;
    height: 100%;
    flex: 1;
  }

  .controls {
    width: 100%;
    height: calc((100cqw - 4 * var(--controls-gutter-size)) * 2 / 3 + 3 * var(--controls-gutter-size));
  }
}
</style>
