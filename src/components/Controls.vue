<script setup lang="ts">
import ColorControl from '@/components/controls/ColorControl.vue'
import {usePlayerStore} from '@/stores/playerStore'
import {ColorType} from '@/types/colorTypes.ts'

const playerStore = usePlayerStore()
</script>

<template>
  <div class="controls">
    <div class="fire-button"></div>
    <div class="colors-container">
      <ColorControl :color="ColorType.red" />
      <ColorControl :color="ColorType.green" />
      <ColorControl :color="ColorType.blue" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles';

.controls {
  background: var(--color-controls-bg);

  .fire-button {
    height: 50%;
  }

  .colors-container {
    @include styles.flex-row(0);
    height: 50%;
    width: 100%;
  }
}
</style>
