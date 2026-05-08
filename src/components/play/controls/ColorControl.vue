<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {ColorType} from '@/types/colorTypes'
import {usePlayerStore} from '@/stores/playerStore'
import {useLongPress} from '@/composables/useLongPress'
import {COLOR_RESET_DELAY_MS} from '@/constants/environment'
import {LOCK} from '@/constants/icons'

const props = defineProps<{
  color: ColorType
}>()

const playerStore = usePlayerStore()
const refs = storeToRefs(playerStore)
const colorLoaded = refs[`${props.color}Loaded` as 'redLoaded' | 'greenLoaded' | 'blueLoaded']
const colorReload = refs[`${props.color}Reload` as 'redReload' | 'greenReload' | 'blueReload']

const isReloading = computed<boolean>(() => colorReload.value > 0)

watch(isReloading, (reloading) => {
  if (reloading) {
    setTimeout(() => { colorReload.value = 0 }, colorReload.value * 1000)
  }
})

const pulses = ref<number[]>([])
let nextPulseId = 0

const {pressing, events} = useLongPress(
  () => {
    if (isReloading.value) return
    colorLoaded.value++
    const id = nextPulseId++
    pulses.value.push(id)
    setTimeout(() => { pulses.value = pulses.value.filter(p => p !== id) }, 500)
  },
  () => {
    colorLoaded.value = 0
  },
  COLOR_RESET_DELAY_MS
)
</script>

<template>
  <div class="color-control-wrapper" :class="{[color]: true}">
    <div
      class="color-control"
      :class="{[color]: true, reloading: isReloading, pressing: pressing && colorLoaded > 0, active: colorLoaded > 0}"
      :style="`--label: '${isReloading ? '' : colorLoaded}'; --reload-duration: ${colorReload}s`"
      v-on="events"
    >
      <i v-if="isReloading" :class="LOCK" class="lock-icon" />
    </div>
    <span v-for="id in pulses" :key="id" class="pulse-ring" />
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

@keyframes reload-progress {
  from { height: 0% }
  to   { height: 100% }
}

@keyframes pulse-expand {
  0%   { box-shadow: 0 0 0 0 currentColor; opacity: 0.7; }
  100% { box-shadow: 0 0 0 var(--space-md) currentColor; opacity: 0; }
}

.color-control-wrapper {
  height: 100%;
  width: 100%;
  position: relative;

  &.red   { --color: var(--color-red); }
  &.blue  { --color: var(--color-blue); }
  &.green { --color: var(--color-green); }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: var(--space-md);
    color: var(--color);
    pointer-events: none;
    animation: pulse-expand 0.5s ease-out forwards;
  }
}

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
    font-size: min(100cqw, 90cqh);
    line-height: 1;
    color: rgba(255, 255, 255, 0.9);
    pointer-events: none;
    overflow: hidden;

    @include styles.text-shadow();
  }

  background: var(--inactive);

  &.active {
    background: var(--color);
  }
  &.reloading {
    background: var(--disabled);

    &::before {
      opacity: 1;
      height: 100%;
      animation: reload-progress var(--reload-duration) linear forwards;
    }
  }

  .lock-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: min(60cqw, 55cqh);
    color: rgba(255, 255, 255, 0.7);
    pointer-events: none;
    @include styles.text-shadow();
  }
}
</style>
