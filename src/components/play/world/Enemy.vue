<script setup lang="ts">
import {computed, ref} from 'vue'
import type {EnemyState} from '@/types/gameTypes.ts'
import {colorHealthToColor, getValueFromColor} from '@/helpers/colorUtils.ts'
import {VERTICAL_UNITS, DAMAGE_FLASH_DURATION_MS, ENEMY_SHRINK_DURATION_MS} from '@/constants/environment.ts'
import {type EventPayload, EventType, useEvents} from '@/composables/useEvents.ts'
import {useTimeout} from '@/composables/useInterval.ts'

const props = defineProps<{
  enemy: EnemyState
}>()

const enemyColor = computed(() => colorHealthToColor(props.enemy.healthRemaining))
const healthValue = computed(() => getValueFromColor(props.enemy.healthRemaining))
const renderHeightCQH = computed(() => healthValue.value * 100 / VERTICAL_UNITS) // each health point is worth 0.5cqh in height

const isFlashing = ref(false)
const animatingHeightCQH = ref<number | null>(null)

const displayHeightCQH = computed(() =>
  animatingHeightCQH.value !== null ? animatingHeightCQH.value : renderHeightCQH.value
)

const {on} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.struckEnemyId !== props.enemy.id) return

  isFlashing.value = true
  useTimeout(() => { isFlashing.value = false }, DAMAGE_FLASH_DURATION_MS)

  if (payload.debris) {
    animatingHeightCQH.value = renderHeightCQH.value
    const targetHeightCQH = getValueFromColor(payload.debris) * 100 / VERTICAL_UNITS
    requestAnimationFrame(() => { animatingHeightCQH.value = targetHeightCQH })
    useTimeout(() => { animatingHeightCQH.value = null }, ENEMY_SHRINK_DURATION_MS)
  }
})
</script>

<template>
  <div class="enemy" :class="{flashing: isFlashing}" :style="{backgroundColor: enemyColor, height: displayHeightCQH + 'cqh'}">
    <span v-for="i in healthValue" :key="i" />
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

@keyframes damage-flash {
  0%, 100% { opacity: 0; }
  50%       { opacity: 1; }
}

.enemy {
  width: 100%;
  // height set inline based on health
  transition: height v-bind('ENEMY_SHRINK_DURATION_MS + "ms"') ease-out;
  @include styles.flex-row(var(--space-xs));
  justify-content: space-evenly;
  padding: var(--space-xs);
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-shadow-light);
  }

  &.flashing::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: white;
    animation: damage-flash v-bind('DAMAGE_FLASH_DURATION_MS + "ms"') steps(1) 4 forwards;
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
