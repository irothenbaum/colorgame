<script setup lang="ts">
import type {LevelDefinition} from '@/types/gameTypes.ts'
import {loadAllLevels} from '@/helpers/levelUtils.ts'
import LevelCard from './select/LevelCard.vue'
import {useHighScoresStore} from '@/stores/highScoresStore.ts'

const emit = defineEmits<{
  play: [level: LevelDefinition]
}>()

const levels: LevelDefinition[] = loadAllLevels()
const highScoresStore = useHighScoresStore()
</script>

<template>
  <div class="select-level">
    <ul class="levels-container">
      <li v-for="l in levels" v-bind:key="l.id">
        <LevelCard :level="l" :high-score="highScoresStore.getLevelScores(l.id)" @play="emit('play', l)" />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.select-level {
  height: 100%;
  width: 100%;
  background: white;

  .levels-container {
    padding: 10vh 0;
    height: 100%;
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
