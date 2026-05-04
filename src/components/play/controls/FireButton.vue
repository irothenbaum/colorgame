<script setup lang="ts">
import {computed} from 'vue'
import {usePlayerStore} from '@/stores/playerStore'
import {colorHealthToColor} from '@/helpers/colorUtils'
import {useLongPress} from '@/composables/useLongPress'
import {COLOR_RESET_DELAY_MS} from '@/constants/environment'

const playerStore = usePlayerStore()

const backgroundColor = computed(() => colorHealthToColor(playerStore.getLoadedColorValue()))

const {pressing, events} = useLongPress(
  () => {},
  () => {
    playerStore.redLoaded = 0
    playerStore.greenLoaded = 0
    playerStore.blueLoaded = 0
  },
  COLOR_RESET_DELAY_MS
)

const textColor = computed(() => {
  const hex = backgroundColor.value
  if (hex === 'black') return '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  // relative luminance (WCAG)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.35 ? '#000000' : '#ffffff'
})
</script>

<template>
  <div class="fire-button">
    <button class="fire-button-inner" :class="{pressing}" :style="{backgroundColor, color: textColor}" v-on="events">
      <span>PRINT</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.fire-button {
  height: 100%;
  width: 100%;
  container-type: size;
}

.fire-button-inner {
  @include styles.long-press-progress(left, styles.$colorResetDelay);
  height: 100%;
  width: 100%;
  border: none;
  border-radius: var(--space-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  @include styles.block-text;
  padding-bottom: 0;
  font-size: min(50cqw, 60cqh);
  line-height: 1;
  letter-spacing: 0.3em; // must match span's margin-right below
  transition: background-color 0.3s ease, color 0.2s ease;

  span {
    display: inline-block;
    transform: translateY(-0.05em);
    margin-right: -0.3em; // cancels trailing letter-spacing gap — must match letter-spacing above
  }
}
</style>
