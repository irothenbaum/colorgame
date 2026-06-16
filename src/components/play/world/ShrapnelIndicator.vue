<script setup lang="ts">
import {computed, ref} from 'vue'
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

type Affirmation = {
  id: number
  label: string
  rotation: number
}

const AFFIRMATIONS = [
  'GREAT!',
  'NICE!',
  'PERFECT!',
  'AWESOME!',
  'SUPERB!',
  'EXCELLENT!',
  'OUTSTANDING!',
  'BRILLIANT!',
  'AMAZING!',
  'LEGENDARY!',
]
const AFFIRMATION_FADE_MS = 150

let nextId = 0
const indicators = ref<Indicator[]>([])
const clearTimer = ref<TimerHandle | null>(null)

const affirmation = ref<Affirmation | null>(null)
const affirmationFadeTimer = ref<TimerHandle | null>(null)
const affirmationRemoveTimer = ref<TimerHandle | null>(null)
const affirmationFading = computed(() => affirmationRemoveTimer.value !== null)

const FADE_DURATION_MS = 800

function showAffirmation() {
  affirmationFadeTimer.value?.cancel()
  affirmationRemoveTimer.value?.cancel()

  affirmation.value = {
    id: nextId++,
    label: AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
    rotation: Math.random() * 16 - 8,
  }

  affirmationFadeTimer.value = useTimeout(() => {
    affirmationFadeTimer.value = null
    affirmationRemoveTimer.value = useTimeout(() => {
      affirmation.value = null
      affirmationRemoveTimer.value = null
    }, AFFIRMATION_FADE_MS)
  }, DAMAGE_FLASH_DURATION_MS)
}

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.track !== props.trackIndex) return

  if (payload.struckEnemyId && !payload.shrapnel && !payload.debris) {
    showAffirmation()
    return
  }

  if (!payload.shrapnel) return
  if (getValueFromColor(payload.shrapnel) === 0) return

  const tipPercent = (props.getCurrentTipPosition() / VERTICAL_UNITS) * 100
  const batch: Indicator[] = []

  if (payload.shrapnel.red > 0) {
    batch.push({
      id: nextId++,
      label: `-${payload.shrapnel.red}`,
      color: 'var(--color-red-pastel)',
      topPercent: tipPercent,
    })
  }
  if (payload.shrapnel.green > 0) {
    batch.push({
      id: nextId++,
      label: `-${payload.shrapnel.green}`,
      color: 'var(--color-green-pastel)',
      topPercent: tipPercent,
    })
  }
  if (payload.shrapnel.blue > 0) {
    batch.push({
      id: nextId++,
      label: `-${payload.shrapnel.blue}`,
      color: 'var(--color-blue-pastel)',
      topPercent: tipPercent,
    })
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

  affirmationFadeTimer.value?.cancel()
  affirmationFadeTimer.value = null
  affirmationRemoveTimer.value?.cancel()
  affirmationRemoveTimer.value = null
  affirmation.value = null
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
  <div
    v-if="affirmation"
    class="affirmation-text"
    :data-text="affirmation.label"
    :class="{fading: affirmationFading}"
    :style="{transform: `translate(-50%, -50%) rotate(${affirmation.rotation}deg)`}"
  >
    {{ affirmation.label }}
  </div>
</template>

<style scoped lang="scss">
$fontSize: calc(var(--base-font-size) * 4);

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
  font-size: $fontSize;
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

.affirmation-text {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  font-family: var(--font-family-title);
  font-weight: 800;
  font-size: $fontSize;
  letter-spacing: 0.02em;
  white-space: nowrap;
  pointer-events: none;
  color: var(--color-black);
  -webkit-text-stroke: 6px var(--color-black);
  paint-order: stroke fill;
  opacity: 1;
  line-height: 1;

  // the visible text is the black stroke+fill above; this overlay redraws the
  // same glyphs with a rainbow gradient fill and no stroke, so only the outer
  // edge of the black layer remains visible as an outline
  &::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    -webkit-text-stroke: 0 transparent;
    background-image: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #d46bff);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }

  &.fading {
    opacity: 0;
    transition: opacity v-bind('`${AFFIRMATION_FADE_MS}ms`') ease-out;
  }
}
</style>
