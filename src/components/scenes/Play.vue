<script setup lang="ts">
import {ref} from 'vue'
import {useGameStore} from '@/stores/gameStore.ts'
import {storeToRefs} from 'pinia'

import LevelSelect from '@/components/play/LevelSelect.vue'
import PlayLevel from '@/components/play/PlayLevel.vue'

const STEP_LEVEL_SELECT = 0
const STEP_PLAY_LEVEL = 1
const STEP_LEVEL_RESULTS = 2

const step = ref<number>(STEP_LEVEL_SELECT)
const gameStore = useGameStore()

function handlePlay(levelId: string) {
  gameStore.instantiateLevel(levelId)
  step.value = STEP_PLAY_LEVEL
}
</script>

<template>
  <div class="play">
    <LevelSelect v-if="step === STEP_LEVEL_SELECT" @play="handlePlay" />
    <PlayLevel v-else-if="step === STEP_PLAY_LEVEL" />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.play {
  height: 100%;
  width: 100%;
}
</style>
