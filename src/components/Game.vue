<script setup lang="ts">
import {Scene} from '@/types/menuTypes.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import SceneSelect from '@/components/scenes/SceneSelect.vue'
import PlayLevel from '@/components/scenes/PlayLevel.vue'
import TrainingLevel from '@/components/scenes/TrainingLevel.vue'
import EndlessLevel from '@/components/scenes/EndlessLevel.vue'
import TutorialLevel from '@/components/scenes/TutorialLevel.vue'
import {storeToRefs} from 'pinia'
import {onMounted} from 'vue'
import {useTimeout} from '@/composables/useInterval.ts'
import DailyLevel from '@/components/scenes/DailyLevel.vue'

const menuStore = useMenuStore()
const {scene, gameHasLoaded} = storeToRefs(menuStore)

onMounted(() => {
  // Ensure the reveal overlay is removed after the animation completes
  useTimeout(() => {
    gameHasLoaded.value = true
  }, 3000) // Match the duration of the reveal-fade animation (1s delay + 2s duration)
})
</script>

<template>
  <div class="game-container">
    <div class="reveal-overlay" v-if="!gameHasLoaded" />
    <SceneSelect v-if="scene === Scene.SCENE_SELECT" />
    <PlayLevel v-else-if="scene === Scene.PLAY_LEVEL" />
    <TrainingLevel v-else-if="scene === Scene.TRAINING" />
    <EndlessLevel v-else-if="scene === Scene.ENDLESS" />
    <DailyLevel v-else-if="scene === Scene.DAILY" />
    <TutorialLevel v-else-if="scene === Scene.TUTORIAL" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles';

.game-container {
  height: 100%;
  width: 100%;
  background: white;
  position: relative;

  @keyframes reveal-fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .reveal-overlay {
    position: absolute;
    inset: 0;
    background: var(--color-white);
    pointer-events: none;
    animation: reveal-fade 2s 1s ease-in forwards;
    z-index: 10;
  }

  .scenes-container {
    padding: 10vh 0;
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    li {
      height: 80vh;
      scroll-snap-align: center;
    }
  }
}
</style>
