<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'

const gameStore = useGameStore()
const {currentLevel} = storeToRefs(gameStore)
</script>

<template>
  <div class="world">
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.world {
  background: var(--color-track-bg);
}
</style>
