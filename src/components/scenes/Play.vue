<script setup lang="ts">
import {ref} from 'vue'
import {useGameStore} from '@/stores/gameStore.ts'
import type {LevelDefinition} from '@/types/gameTypes.ts'
import {PlayState} from '@/types/gameTypes.ts'
import {storeToRefs} from 'pinia'
import LevelSelect from '@/components/play/LevelSelect.vue'
import PlayLevel from '@/components/play/PlayLevel.vue'

const STEP_LEVEL_SELECT = 0
const STEP_PLAY_LEVEL = 1

const step = ref<number>(STEP_LEVEL_SELECT)
const gameStore = useGameStore()
const {worldState} = storeToRefs(gameStore)

function handlePlay(level: LevelDefinition) {
  gameStore.instantiateLevel(level)
  step.value = STEP_PLAY_LEVEL
}
</script>

<template>
  <div class="play">
    <div v-if="worldState!.playState === PlayState.Paused" class="pause-overlay">
      PAUSED
    </div>
    <LevelSelect v-if="step === STEP_LEVEL_SELECT" @play="handlePlay" />
    <PlayLevel v-else-if="step === STEP_PLAY_LEVEL" />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.play {
  height: 100%;
  width: 100%;

  .pause-overlay {
    position:fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-shadow);
    color: var(--color-white);
    @include styles.flex-row();
  }
}
</style>
