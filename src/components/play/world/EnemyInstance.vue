<script setup lang="ts">
import {computed, ref, watchEffect} from 'vue'
import {EnemyType} from '@/types/gameTypes.ts'
import type {EnemyState} from '@/types/gameTypes.ts'
import {colorHealthToColor, getContrastColor, getValueFromColor} from '@/helpers/colorUtils.ts'
import {VERTICAL_UNITS, DAMAGE_FLASH_DURATION_MS, ENEMY_SHRINK_DURATION_MS} from '@/constants/environment.ts'
import {type EventPayload, EventType, useEvents} from '@/composables/useEvents.ts'
import {useTimeout} from '@/composables/useInterval.ts'

const props = defineProps<{
  enemy: EnemyState
}>()

const healthValue = computed(() => getValueFromColor(props.enemy.healthRemaining))

// this needs to be a watchEffect + ref instead of computed so we don't overwrite to Black when health hits 0, which would break the death animation
const displayColor = ref(colorHealthToColor(props.enemy.healthRemaining))
watchEffect(() => {
  if (healthValue.value > 0) {
    displayColor.value = colorHealthToColor(props.enemy.healthRemaining)
  }
})

const contrastColor = computed(() => getContrastColor(displayColor.value))

const isFlashing = ref(false)
const isDestroyed = ref(false)
const visualHeightCQH = ref<number | null>(null)
const displayHeightCQH = computed(() => visualHeightCQH.value ?? (healthValue.value * 100) / VERTICAL_UNITS)

const {on, broadcast} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.struckEnemyId !== props.enemy.id) {
    return
  }
  if (getValueFromColor(payload.damageDone!) === 0) {
    return
  }

  const targetHeightCQH = payload.debris ? (getValueFromColor(payload.debris) * 100) / VERTICAL_UNITS : 0

  visualHeightCQH.value = (healthValue.value * 100) / VERTICAL_UNITS
  isFlashing.value = true

  requestAnimationFrame(() => {
    visualHeightCQH.value = targetHeightCQH
    if (targetHeightCQH === 0) {
      isDestroyed.value = true
    }
  })

  useTimeout(() => {
    isFlashing.value = false
  }, DAMAGE_FLASH_DURATION_MS)

  useTimeout(() => {
    visualHeightCQH.value = null
    if (!payload.debris) {
      broadcast(EventType.EnemyDestroyed, {enemyId: props.enemy.id})
    }
  }, DAMAGE_FLASH_DURATION_MS + ENEMY_SHRINK_DURATION_MS)
})
</script>

<template>
  <div class="enemy-container" :class="{[enemy.type]: true}" :style="{height: displayHeightCQH + 'cqh'}">
    <div
      class="enemy"
      :class="{flashing: isFlashing}"
      :style="{backgroundColor: displayColor, height: displayHeightCQH + 'cqh', padding: isDestroyed ? '0' : ''}"
    >
      <div v-if="enemy.type === EnemyType.Atomic">
        <div class="atomic-label" :style="{color: contrastColor, backgroundColor: displayColor}">
          {{ healthValue }}
        </div>
      </div>
      <div v-else v-for="i in healthValue" :key="i" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

@keyframes atomic-shine {
  0% {
    transform: rotate(30deg) translateX(-100%);
  }
  50% {
    transform: rotate(30deg) translateX(100%);
  }
  100% {
    transform: rotate(30deg) translateX(100%);
  }
}

.enemy-container {
  width: 100%;
  overflow: visible;
  position: relative;
  @include styles.drop-shadow();

  &.atomic {
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      pointer-events: none;
      z-index: 4;
      background: linear-gradient(
        to right,
        transparent 35%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 65%
      );
      transform: rotate(30deg) translateX(-100%);
      animation: atomic-shine 3s ease-in-out infinite;
    }
  }
}

.enemy {
  --damage-flash-step-dur: v-bind('(DAMAGE_FLASH_DURATION_MS / 3) + "ms"');
  @include styles.enemy-block();
  width: 100%;
  height: 100%;
  bottom: 0;
}

$labelDimension: calc(var(--font-size-xl) + var(--space-md));
.atomic-label {
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: center;
  height: $labelDimension;
  width: $labelDimension;
  border-top: var(--space-xs) solid var(--color-shadow-light);
  border-right: var(--space-xs) solid var(--color-shadow-light);

  z-index: 2;
  font-weight: 700;
  font-size: var(--font-size-xl);
  line-height: 1.2;
  color: white;
  @include styles.text-shadow();
}
</style>
