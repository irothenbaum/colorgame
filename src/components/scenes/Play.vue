<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'
import {useGameStore} from '@/stores/gameStore.ts'
import type {LevelDefinition} from '@/types/gameTypes.ts'
import {PlayState} from '@/types/gameTypes.ts'
import {storeToRefs} from 'pinia'
import LevelSelect from '@/components/play/LevelSelect.vue'
import PlayLevel from '@/components/play/PlayLevel.vue'
import PauseModal from '@/components/play/PauseModal.vue'

const STEP_LEVEL_SELECT = 0
const STEP_PLAY_LEVEL = 1

const step = ref<number>(STEP_LEVEL_SELECT)
const gameStore = useGameStore()
const {levelState} = storeToRefs(gameStore)

function handlePlay(level: LevelDefinition) {
  gameStore.startLevel(level)
  step.value = STEP_PLAY_LEVEL
}

function handleBack() {
  if (step.value === STEP_PLAY_LEVEL) {
    gameStore.togglePause()
  }
}

function onPopState() {
  handleBack()
  // Push a new state so the back button remains available next time
  history.pushState(null, '', location.href)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleBack()
}

onMounted(() => {
  history.pushState(null, '', location.href)
  window.addEventListener('popstate', onPopState)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="play">
    <PauseModal v-if="levelState?.playState === PlayState.Paused" />
    <LevelSelect v-if="step === STEP_LEVEL_SELECT" @play="handlePlay" />
    <PlayLevel v-else-if="step === STEP_PLAY_LEVEL" />
  </div>
</template>

<style scoped lang="scss">
.play {
  height: 100%;
  width: 100%;
}
</style>
