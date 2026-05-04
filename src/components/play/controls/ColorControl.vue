<script setup lang="ts">
import {computed} from 'vue'
import {storeToRefs} from 'pinia'
import {ColorType} from '@/types/colorTypes'
import {usePlayerStore} from '@/stores/playerStore'
import {useLongPress} from '@/composables/useLongPress'
import {COLOR_RESET_DELAY_MS} from '@/constants/environment'

const props = defineProps<{
  color: ColorType
}>()

const playerStore = usePlayerStore()
const refs = storeToRefs(playerStore)
const colorLoaded = refs[`${props.color}Loaded` as 'redLoaded' | 'greenLoaded' | 'blueLoaded']
const colorReload = refs[`${props.color}Reload` as 'redReload' | 'greenReload' | 'blueReload']

const isReloading = computed<boolean>(() => colorReload.value > 0)

const {pressing, events} = useLongPress(
  () => {
    if (isReloading.value) return
    colorLoaded.value++
  },
  () => {
    colorLoaded.value = 0
  },
  COLOR_RESET_DELAY_MS
)
</script>

<template>
  <div
    class="color-control"
    :class="{[color]: true, reloading: isReloading, pressing: pressing && colorLoaded > 0, active: colorLoaded > 0}"
    :style="`--label: '${colorLoaded}'`"
    v-on="events"
  ></div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.color-control {
  &.red {
    --color: var(--color-red);
    --inactive: var(--color-red-inactive);
    --disabled: var(--color-red-disabled);
  }

  &.blue {
    --color: var(--color-blue);
    --inactive: var(--color-blue-inactive);
    --disabled: var(--color-blue-disabled);
  }

  &.green {
    --color: var(--color-green);
    --inactive: var(--color-green-inactive);
    --disabled: var(--color-green-disabled);
  }

  height: 100%;
  width: 100%;
  border-radius: var(--space-md);
  container-type: size;
  @include styles.long-press-progress(bottom, styles.$colorResetDelay);

  &::after {
    content: var(--label);
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    @include styles.block-text;
    font-size: min(100cqw, 100cqh);
    line-height: 1;
    color: rgba(255, 255, 255, 0.9);
    pointer-events: none;
    overflow: hidden;
  }

  border: 0.5em solid var(--color);
  background: var(--inactive);

  &.active {
    background: var(--color);
  }
  &.reloading {
    background: var(--disabled);
  }
}
</style>
