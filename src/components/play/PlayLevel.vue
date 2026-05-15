<script setup lang="ts">
import {watch} from 'vue'
import Controls from './controls/Controls.vue'
import World from './world/World.vue'
import {storeToRefs} from 'pinia'
import {useGameStore} from '@/stores/gameStore.ts'
import {useEvents, EventType} from '@/composables/useEvents.ts'

const gameStore = useGameStore()
const {levelState} = storeToRefs(gameStore)

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
    height: var(--controls-height);
  }
}
</style>
