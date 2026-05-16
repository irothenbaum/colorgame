<script setup lang="ts">
import {Scene} from '@/types/menuTypes.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import SceneSelect from '@/components/scenes/SceneSelect.vue'
import PlayLevel from '@/components/scenes/PlayLevel.vue'
import TrainingLevel from '@/components/scenes/TrainingLevel.vue'
import EndlessLevel from '@/components/scenes/EndlessLevel.vue'
import TutorialLevel from '@/components/scenes/TutorialLevel.vue'
import {storeToRefs} from 'pinia'

const menuStore = useMenuStore()
const {scene} = storeToRefs(menuStore)
</script>

<template>
  <div class="game-container">
    <SceneSelect v-if="scene === Scene.SCENE_SELECT" />
    <PlayLevel v-else-if="scene === Scene.PLAY_LEVEL" />
    <TrainingLevel v-else-if="scene === Scene.TRAINING" />
    <EndlessLevel v-else-if="scene === Scene.ENDLESS" />
    <TutorialLevel v-else-if="scene === Scene.TUTORIAL" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles';

.game-container {
  height: 100%;
  width: 100%;
  background: white;

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
