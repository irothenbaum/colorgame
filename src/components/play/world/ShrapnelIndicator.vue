<script setup lang="ts">
import {ref} from 'vue'
import {DAMAGE_FLASH_DURATION_MS, VERTICAL_UNITS} from '@/constants/environment.ts'
import {type TimerHandle, useTimeout} from '@/composables/useInterval.ts'
import type {EventPayload} from '@/composables/useEvents.ts'
import {EventType, useEvents} from '@/composables/useEvents.ts'
import {getValueFromColor} from '@/helpers/colorUtils.ts'

const props = defineProps<{
  trackIndex: number
  getCurrentTipPosition: () => number
}>()

const {on} = useEvents()

type Indicator = {
  id: number
  label: string
  color: string
  topPercent: number
}

let nextId = 0
const indicators = ref<Indicator[]>([])
let clearTimer = ref<TimerHandle | null>(null)

const FADE_DURATION_MS = 800

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.track !== props.trackIndex || !payload.shrapnel) return
  if (getValueFromColor(payload.shrapnel) === 0) return

  const tipPercent = (props.getCurrentTipPosition() / VERTICAL_UNITS) * 100
  const batch: Indicator[] = []

  if (payload.shrapnel.red > 0) {
    batch.push({id: nextId++, label: `-${payload.shrapnel.red}`, color: 'var(--color-red-pastel)', topPercent: tipPercent})
  }
  if (payload.shrapnel.green > 0) {
    batch.push({id: nextId++, label: `-${payload.shrapnel.green}`, color: 'var(--color-green-pastel)', topPercent: tipPercent})
  }
  if (payload.shrapnel.blue > 0) {
    batch.push({id: nextId++, label: `-${payload.shrapnel.blue}`, color: 'var(--color-blue-pastel)', topPercent: tipPercent})
  }

  indicators.value.push(...batch)

  clearTimer.value?.cancel()
  clearTimer.value = useTimeout(() => {
    const batchIds = new Set(batch.map(i => i.id))
    indicators.value = indicators.value.filter(i => !batchIds.has(i.id))
  }, FADE_DURATION_MS)
})

function clear() {
  clearTimer.value?.cancel()
  clearTimer.value = null
  indicators.value = []
}

on(EventType.LevelLost, clear)
on(EventType.LevelWon, clear)
</script>

<template>
  <TransitionGroup name="shrapnel" tag="div" class="shrapnel-container">
    <div
      v-for="ind in indicators"
      :key="ind.id"
      class="shrapnel-indicator"
      :style="{top: `${ind.topPercent}%`, color: ind.color}"
    >
      {{ ind.label }}
    </div>
  </TransitionGroup>
</template>

<style scoped lang="scss">
.shrapnel-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.shrapnel-indicator {
  position: absolute;
  left: 33%;
  transform: translateX(-50%);
  font-size: var(--font-size-lg);
  font-weight: bold;
  white-space: nowrap;
  text-shadow: 0 0 4px currentColor;
}

.shrapnel-enter-active {
  animation: shrapnel-fall v-bind('`${FADE_DURATION_MS}ms`') ease-out forwards;
}

@keyframes shrapnel-fall {
  from {
    opacity: 1;
    translate: 0 0;
  }
  to {
    opacity: 0;
    translate: 0 20px;
  }
}
</style>
