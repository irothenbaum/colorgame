<script setup lang="ts">
import {storeToRefs} from 'pinia'
import ColorControl from './ColorControl.vue'
import {usePlayerStore} from '@/stores/playerStore'
import {useGameStore} from '@/stores/gameStore'
import {ColorType} from '@/types/colorTypes.ts'
import FireButton from './FireButton.vue'
import ShiftTrack from './ShiftTrack.vue'

const playerStore = usePlayerStore()
const gameStore = useGameStore()

const {currentLevel} = storeToRefs(gameStore)

</script>

<template>
  <div class="controls">
    <div class="action-controls">
      <ShiftTrack :value="-1" v-if="currentLevel && currentLevel.tracks > 1" />
      <FireButton />
      <ShiftTrack :value="1" v-if="currentLevel && currentLevel.tracks > 1" />
    </div>
    <div class="colors-container">
      <ColorControl :color="ColorType.red" />
      <ColorControl :color="ColorType.green" />
      <ColorControl :color="ColorType.blue" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.controls {
  background: var(--color-controls-bg);

  .action-controls {
    height: 50%;
    @include styles.flex-row(0);
    padding: var(--controls-gutter-size) var(--controls-gutter-size) 0;
    width: 100%;

    .fire-button:not(:first-child) {
      flex: 6;
      margin: 0 var(--controls-gutter-size);
    }

    .shift-track {
      flex: 1;
    }
  }
  .colors-container {
    height: 50%;
    @include styles.flex-row(var(--controls-gutter-size));
    padding: var(--controls-gutter-size);
    width: 100%;
  }
}
</style>
