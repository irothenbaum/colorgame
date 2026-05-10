<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {useGameStore} from '@/stores/gameStore.ts'
import {usePlayerStore} from '@/stores/playerStore.ts'

const props = defineProps<{
  value: 1 | -1
}>()

const gameStore = useGameStore()
const playerStore = usePlayerStore()

const {currentLevel} = storeToRefs(gameStore)
const {activeTrack} = storeToRefs(playerStore)

function handleShift() {
  if (!currentLevel.value) {
    return
  }
  activeTrack.value = (currentLevel.value!.tracks + activeTrack.value + props.value) % currentLevel.value!.tracks
  console.log('Shifted to track', activeTrack.value)
}
</script>

<template>
  <div class="shift-track" @click="handleShift">
    <span class="sign">{{ value === 1 ? '>' : '<' }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.shift-track {
  height: 100%;
  width: 100%;
  background: var(--color-light-grey);
  border-radius: var(--space-sm);
  container-type: size;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-shadow-light);

  .sign {
    @include styles.block-text;
    font-size: min(70cqw, 90cqh);
    line-height: 1;
    color: var(--color-dark-grey);
  }
}
</style>
