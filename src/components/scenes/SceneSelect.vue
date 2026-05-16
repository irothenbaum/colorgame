<script setup lang="ts">
import type {LevelDefinition} from '@/types/gameTypes.ts'
import {loadAllLevels} from '@/helpers/levelUtils.ts'
import {useHighScoresStore} from '@/stores/highScoresStore.ts'
import LevelCard from '@/components/menu/LevelCard.vue'
import EndlessCard from '@/components/menu/EndlessCard.vue'
import TrainingCard from '@/components/menu/TrainingCard.vue'
import LandingCard from '@/components/menu/LandingCard.vue'
import TutorialCard from '@/components/menu/TutorialCard.vue'

const levels: LevelDefinition[] = loadAllLevels()
const highScoresStore = useHighScoresStore()
</script>

<template>
  <ul class="scenes-container">
    <li>
      <EndlessCard />
    </li>
    <li>
      <TrainingCard />
    </li>
    <li>
      <LandingCard />
    </li>
    <li>
      <TutorialCard />
    </li>
    <li v-for="l in levels" v-bind:key="l.id">
      <LevelCard :level="l" :high-score="highScoresStore.getLevelScores(l.id)" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../styles';

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

</style>
