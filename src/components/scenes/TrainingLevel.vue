<script setup lang="ts">
import {computed, onMounted, onUnmounted} from 'vue'
import PlayControls from '@/components/play/controls/PlayControls.vue'
import TrainingEnemy from '@/components/training/TrainingEnemy.vue'
import {useGameStore} from '@/stores/gameStore.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'
import {EventType, useEvents} from '@/composables/useEvents.ts'
import {type LevelDefinition, PlayState} from '@/types/gameTypes.ts'
import {storeToRefs} from 'pinia'
import {generateRandomEnemy} from '@/helpers/gameUtils.ts'
import PauseModal from '@/components/play/PauseModal.vue'

const TRAINING_LEVEL: LevelDefinition = {
  id: 'training',
  name: 'Training',
  description: '',
  tracks: 1,
  enemies: [],
}

const menuStore = useMenuStore()
const gameStore = useGameStore()
const {levelState} = storeToRefs(gameStore)
const {on} = useEvents()

const activeEnemy = computed(() => {
  if (!levelState.value) return null
  const killed = new Set(levelState.value.killedEnemyIds)
  return Object.values(levelState.value.enemiesLookup).find(e => !killed.has(e.id)) ?? null
})

function spawnEnemy() {
  if (!levelState.value) return
  const enemy = generateRandomEnemy(0)
  levelState.value.enemiesLookup[enemy.id] = enemy
}

on(EventType.EnemyDestroyed, () => {
  spawnEnemy()
})

function handleBack() {
  gameStore.endLevel()
  menuStore.goToScene(Scene.SCENE_SELECT)
}

function onPopState() {
  handleBack()
  history.pushState(null, '', location.href)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleBack()
}

onMounted(() => {
  gameStore.startLevel(TRAINING_LEVEL)
  spawnEnemy()
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
  <div class="training-level">
    <div class="training-world">
      <TrainingEnemy v-if="activeEnemy" :key="activeEnemy.id" :enemy="activeEnemy" />
    </div>
    <PlayControls />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.training-level {
  @include styles.flex-column(0);
  height: 100%;
  width: 100%;
  container-type: inline-size;
  background: black;

  .training-world {
    width: 100%;
    flex: 1;
    container-type: size;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .controls {
    width: 100%;
    height: var(--controls-height);
  }
}
</style>
