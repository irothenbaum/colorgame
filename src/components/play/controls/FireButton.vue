<script setup lang="ts">
import {computed} from 'vue'
import {usePlayerStore} from '@/stores/playerStore'
import {colorHealthToColor, getContrastColor} from '@/helpers/colorUtils'
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
  return getContrastColor(backgroundColor.value)
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
  @include styles.text-shadow();
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
