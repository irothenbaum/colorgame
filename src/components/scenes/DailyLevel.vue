<script setup lang="ts">
import {onMounted, onUnmounted, watch} from 'vue'
import PlayControls from '@/components/play/controls/PlayControls.vue'
import LevelWorld from '@/components/play/world/LevelWorld.vue'
import {storeToRefs} from 'pinia'
import {useGameStore} from '@/stores/gameStore.ts'
import {EventType, useEvents} from '@/composables/useEvents.ts'
import {EnemyType, PlayState} from '@/types/gameTypes.ts'
import type {EnemyDefinition, LevelDefinition} from '@/types/gameTypes.ts'
import type {ColorValue} from '@/types/colorTypes.ts'
import {ColorType} from '@/types/colorTypes.ts'
import LevelResults from '@/components/play/LevelResults.vue'
import PauseModal from '@/components/play/PauseModal.vue'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'
import {dRandom, resetSeed} from '@/utilities.ts'
import {SEED_CACHE_KEY} from '@/constants/environment.ts'

const menuStore = useMenuStore()
const gameStore = useGameStore()
const {levelState, currentLevel} = storeToRefs(gameStore)
const {broadcast} = useEvents()

function dShuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(dRandom() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function generateDailyLevel(): LevelDefinition {
  const today = new Date().toISOString().split('T')[0]

  const prevSeed = localStorage.getItem(SEED_CACHE_KEY)
  localStorage.setItem(SEED_CACHE_KEY, today)
  resetSeed()

  const trackCount = Math.floor(dRandom() * 3) + 1

  const channels: Array<keyof ColorValue> = [ColorType.red, ColorType.green, ColorType.blue]
  const enemies: EnemyDefinition[] = []

  for (let i = 0; i < 100; i++) {
    const shuffled = dShuffle(channels)
    const activeCount = Math.ceil(dRandom() * 3)

    const health: ColorValue = {red: 0, green: 0, blue: 0}
    shuffled.slice(0, activeCount).forEach(ch => {
      health[ch] = Math.ceil(dRandom() * 4)
    })

    enemies.push({
      type: EnemyType.Composite,
      health,
      track: Math.floor(dRandom() * trackCount),
    })
  }

  if (prevSeed !== null) {
    localStorage.setItem(SEED_CACHE_KEY, prevSeed)
    resetSeed()
  } else {
    localStorage.removeItem(SEED_CACHE_KEY)
  }

  return {
    id: `daily-${today}`,
    name: 'Daily Challenge',
    description: today,
    tracks: trackCount,
    enemies,
  }
}

const dailyLevel = generateDailyLevel()

watch(
  () => levelState.value?.killedEnemyIds,
  ids => {
    if (!ids || ids.length === 0) {
      return
    }
    if (ids.length === Object.keys(levelState.value!.enemiesLookup).length) {
      broadcast(EventType.LevelWon, {trackId: levelState.value!.enemiesLookup[ids[ids.length - 1]].track})
    }
  },
  {deep: true},
)

function handleBackToSelect() {
  gameStore.endLevel()
  menuStore.goToScene(Scene.SCENE_SELECT)
}

function onPopState() {
  gameStore.togglePause()
  history.pushState(null, '', location.href)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    gameStore.togglePause()
  }
}

onMounted(() => {
  gameStore.startLevel(dailyLevel)
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
  <PauseModal v-if="levelState?.playState === PlayState.Paused" />
  <LevelResults
    v-if="levelState?.playState === PlayState.Won || levelState?.playState === PlayState.Lost"
    @back="handleBackToSelect"
    @replay="gameStore.startLevel(currentLevel as LevelDefinition)"
  />
  <div class="daily-level">
    <LevelWorld />
    <PlayControls />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.daily-level {
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
    height: var(--controls-height);
  }
}
</style>
