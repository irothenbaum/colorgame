<script setup lang="ts">
import type {CSSProperties} from 'vue'
import {computed, ref} from 'vue'
import {DAMAGE_FLASH_DURATION_MS, VERTICAL_UNITS} from '@/constants/environment.ts'
import {type TimerHandle, useTimeout} from '@/composables/useInterval.ts'
import type {EventPayload} from '@/composables/useEvents.ts'
import {EventType, useEvents} from '@/composables/useEvents.ts'
import {colorHealthToColor} from '@/helpers/colorUtils.ts'
import type {ColorValue} from '@/types/colorTypes.ts'

const props = defineProps<{
  trackIndex: number
  tipPosition: number // current visual position of the furthest-advanced enemy (in vertical units)
}>()

const {on} = useEvents()

const beamColor = ref<ColorValue | null>(null)
const beamTimer = ref<TimerHandle | null>(null)
const beamFading = ref<boolean>(false)

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.track !== props.trackIndex) return

  beamTimer.value?.cancel()
  beamColor.value = payload.projectile
  beamFading.value = false
  requestAnimationFrame(() => {
    beamFading.value = true
  })
  beamTimer.value = useTimeout(() => {
    beamColor.value = null
    beamFading.value = false
  }, DAMAGE_FLASH_DURATION_MS)
})

function clear() {
  beamTimer.value?.cancel()
  beamTimer.value = null
  beamColor.value = null
  beamFading.value = false
}

on(EventType.LevelLost, clear)
on(EventType.LevelWon, clear)

const beamStyles = computed<CSSProperties>(() => {
  if (!beamColor.value) return {display: 'none'}
  const tipPercent = (props.tipPosition / VERTICAL_UNITS) * 100
  const heightPercent = 100 - tipPercent
  return {
    background: colorHealthToColor(beamColor.value),
    height: `${heightPercent}%`,
  }
})
</script>

<template>
  <div class="beam" :class="{fading: beamFading}" :style="beamStyles" />
</template>

<style scoped lang="scss">
.beam {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  opacity: 1;
  pointer-events: none;
  z-index: 1;
  transition: none;

  &.fading {
    opacity: 0;
    transition: opacity v-bind('`${DAMAGE_FLASH_DURATION_MS}ms`') linear;
  }
}
</style>
