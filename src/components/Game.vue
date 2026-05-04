<script setup lang="ts">
import Menu from './scenes/Menu.vue';
import Play from './scenes/Play.vue';
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'
import {Scene} from '@/types/gameTypes'

const gameStore = useGameStore()
const {scene} = storeToRefs(gameStore)
</script>

<template>
  <div class="game">
    <Menu v-if="scene === Scene.MENU" />
    <Play v-if="scene === Scene.PLAY" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles';

.game {
  height: 100%;
  width: 100%;
}
</style>
