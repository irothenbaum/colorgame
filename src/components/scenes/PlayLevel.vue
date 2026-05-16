<script setup lang="ts">
import {onMounted, onUnmounted, watch} from 'vue'
import PlayControls from '@/components/play/controls/PlayControls.vue'
import World from '@/components/play/world/World.vue'
import {storeToRefs} from 'pinia'
import {useGameStore} from '@/stores/gameStore.ts'
import {useEvents, EventType} from '@/composables/useEvents.ts'
import {type LevelDefinition, PlayState} from '@/types/gameTypes.ts'
import LevelResults from '@/components/play/LevelResults.vue'
import PauseModal from '@/components/play/PauseModal.vue'

const gameStore = useGameStore()
const {levelState, currentLevel} = storeToRefs(gameStore)

const {broadcast} = useEvents()
// watch for game end
watch(
  () => levelState.value?.killedEnemyIds,
  ids => {
    if (!ids || ids.length === 0) {
      return
    }
    // if we've killed as many enemies as we have spawned, the level must be over
    if (ids.length === Object.keys(levelState.value!.enemiesLookup).length) {
      // indicate what track the last enemy was on, so we can trigger the right win animation
      broadcast(EventType.LevelWon, levelState.value!.enemiesLookup[ids[ids.length - 1]].track)
    }
  },
  {deep: true},
)

function handlePlay(level: LevelDefinition) {
  gameStore.startLevel(level)
}

function onPopState() {
  gameStore.togglePause()
  // Push a new state so the back button remains available next time
  history.pushState(null, '', location.href)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    gameStore.togglePause()
  }
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
  <PauseModal v-if="levelState?.playState === PlayState.Paused" />
  <LevelResults
    v-if="levelState?.playState === PlayState.Won || levelState?.playState === PlayState.Lost"
    @back="gameStore.endLevel()"
    @replay="handlePlay(currentLevel as LevelDefinition)"
  />
  <div class="play-level">
    <World />
    <PlayControls />
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
    height: var(--controls-height);
  }
}
</style>
