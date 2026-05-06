<script setup lang="ts">
import {computed} from 'vue'
import {usePlayerStore} from '@/stores/playerStore'
import {useGameStore} from '@/stores/gameStore'
import {colorHealthToColor, getContrastColor} from '@/helpers/colorUtils'
import {useLongPress} from '@/composables/useLongPress'
import {COLOR_RESET_DELAY_MS} from '@/constants/environment'
import {storeToRefs} from 'pinia'
import {getValueFromHealth} from '@/helpers/gameUtils.ts'

const gameStore = useGameStore()
const playerStore = usePlayerStore()

const {activeTrack} = storeToRefs(playerStore)

const loadedColor = computed(() => playerStore.getLoadedColorValue())
const backgroundColor = computed(() => colorHealthToColor(loadedColor.value))

const {pressing, events} = useLongPress(
  () => {
    if (getValueFromHealth(loadedColor.value) === 0) {
      return
    }
    playerStore.handleFireResult(gameStore.fireShot(activeTrack.value, loadedColor.value))
  },
  () => {
    playerStore.redLoaded = 0
    playerStore.greenLoaded = 0
    playerStore.blueLoaded = 0
  },
  COLOR_RESET_DELAY_MS
)

const textColor = computed(() => {
  return getContrastColor(backgroundColor.value)
})

const label = "PRINT"
</script>

<template>
  <div class="fire-button">
    <button class="fire-button-inner" :class="{pressing}" :style="{backgroundColor, color: textColor}" v-on="events">
      <span v-for="(char, index) in label" :key="index" class="fire-button-char">
        {{ char }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.fire-button {
  height: 100%;
  width: 100%;
  container-type: size;

  .fire-button-inner {
    @include styles.flex-row();
    padding: 0 10cqw;
    justify-content: space-between;
    @include styles.long-press-progress(left, styles.$colorResetDelay);
    height: 100%;
    width: 100%;
    border: none;
    border-radius: var(--space-md);
    cursor: pointer;
    @include styles.block-text;
    @include styles.text-shadow();
    font-size: min(50cqw, 60cqh);
    transition:
      background-color 0.3s ease,
      color 0.2s ease;
  }
}
</style>
