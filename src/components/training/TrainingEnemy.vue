<script setup lang="ts">
import {computed, ref, watchEffect} from 'vue'
import type {EnemyState} from '@/types/gameTypes.ts'
import {colorHealthToColor, getValueFromColor} from '@/helpers/colorUtils.ts'
import {DAMAGE_FLASH_DURATION_MS, ENEMY_SHRINK_DURATION_MS, VERTICAL_UNITS} from '@/constants/environment.ts'
import {type EventPayload, EventType, useEvents} from '@/composables/useEvents.ts'
import {useTimeout} from '@/composables/useInterval.ts'

const props = defineProps<{
  enemy: EnemyState
}>()

const healthValue = computed(() => getValueFromColor(props.enemy.healthRemaining))
const displayColor = ref(colorHealthToColor(props.enemy.healthRemaining))

watchEffect(() => {
  if (healthValue.value > 0) displayColor.value = colorHealthToColor(props.enemy.healthRemaining)
})

const isFlashing = ref(false)
const isDestroyed = ref(false)
const visualSizeCQH = ref<number | null>(null)
const displaySizeCQH = computed(() => visualSizeCQH.value ?? (healthValue.value * 100) / VERTICAL_UNITS)

const {on, broadcast} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.struckEnemyId !== props.enemy.id) {
    return
  }
  if (getValueFromColor(payload.damageDone!) === 0) {
    return
  }

  const targetSizeCQH = payload.debris ? (getValueFromColor(payload.debris) * 100) / VERTICAL_UNITS : 0

  visualSizeCQH.value = (healthValue.value * 100) / VERTICAL_UNITS
  isFlashing.value = true

  requestAnimationFrame(() => {
    visualSizeCQH.value = targetSizeCQH
    if (targetSizeCQH === 0) {
      isDestroyed.value = true
    }
  })

  useTimeout(() => {
    isFlashing.value = false
  }, DAMAGE_FLASH_DURATION_MS)

  useTimeout(() => {
    visualSizeCQH.value = null
    if (!payload.debris) {
      broadcast(EventType.EnemyDestroyed, {enemyId: props.enemy.id})
    }
  }, DAMAGE_FLASH_DURATION_MS + ENEMY_SHRINK_DURATION_MS)
})
</script>

<template>
  <div
    class="training-enemy"
    :class="{flashing: isFlashing}"
    :style="{
      backgroundColor: displayColor,
      width: displaySizeCQH + 'cqh',
      height: displaySizeCQH + 'cqh',
      padding: isDestroyed ? '0' : '',
    }"
  >
    <span v-for="i in healthValue" :key="i" />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

@keyframes damage-flash {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.training-enemy {
  border-radius: var(--border-radius-lg);
  position: relative;
  transition:
    width v-bind('ENEMY_SHRINK_DURATION_MS + "ms"') ease-out,
    height v-bind('ENEMY_SHRINK_DURATION_MS + "ms"') ease-out,
    padding v-bind('ENEMY_SHRINK_DURATION_MS + "ms"') ease-out;
  @include styles.flex-row(var(--space-xs));
  justify-content: space-evenly;
  padding: var(--space-xs);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--color-shadow-light);
  }

  &.flashing::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: white;
    animation: damage-flash v-bind('(DAMAGE_FLASH_DURATION_MS / 3) + "ms"') steps(2, end) 3 forwards;
    pointer-events: none;
    z-index: 3;
  }

  span {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius-sm);
    background-color: inherit;
  }
}
</style>
