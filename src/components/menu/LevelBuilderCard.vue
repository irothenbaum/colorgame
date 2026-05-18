<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'
import Button from '@/components/utility/Button.vue'

const gameStore = useGameStore()
const {currentLevel} = storeToRefs(gameStore)
</script>

<template>
  <div class="menu">
    <h1>Level Builder</h1>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.menu {
  @include styles.level-card();
}
</style>
