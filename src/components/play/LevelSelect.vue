<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore.ts'
import {storeToRefs} from 'pinia'
import type {LevelState} from '@/types/gameTypes.ts'
import {loadAllLevels} from '@/helpers/levelUtils.ts'

const gameStore = useGameStore()
const {currentLevel} = storeToRefs(gameStore)

const levels: LevelState[] = loadAllLevels()
</script>

<template>
  <div class="select-level">
    <ul class="levels-container">
      <li v-for="l in levels" v-bind:key="l.id">
        <p>{{l.id}}</p>
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
    height: 100%;
    overflow-y: scroll;
    min-height: 100%;

    li {
      height: 100%;
      @include styles.flex-column();
      justify-content: center;
      background-color: green;
    }
  }
}
</style>
