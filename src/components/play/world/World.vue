<script setup lang="ts">
import {watch} from 'vue'
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'
import EnemyTrack from '@/components/play/world/EnemyTrack.vue'
import Results from '@/components/play/Results.vue'
import {PlayState} from '@/types/gameTypes.ts'

const gameStore = useGameStore()
const {currentLevel, levelState} = storeToRefs(gameStore)
</script>

<template>
  <div class="world">
    <EnemyTrack v-for="i in currentLevel!.tracks" :key="i" :track-index="i - 1" />
    <Results v-if="levelState?.playState === PlayState.Won || levelState?.playState === PlayState.Lost" />
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.world {
  position: relative;
  background: var(--color-track-bg);
  @include styles.flex-row(0);
  overflow: hidden;
  &:after {
    z-index: 10;
    width: 100%;
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2rem;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.1) 30%,
      rgba(0, 0, 0, 0)
    );
    pointer-events: none;
  }
}
</style>
