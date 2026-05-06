<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'
import EnemyTrack from '@/components/play/world/EnemyTrack.vue'

const gameStore = useGameStore()
const {currentLevel} = storeToRefs(gameStore)


</script>

<template>
  <div class="world">
    <EnemyTrack v-for="i in currentLevel!.tracks" :key="i" :track-index="i - 1" />
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.world {
  background: var(--color-track-bg);
}
</style>
