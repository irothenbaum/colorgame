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
    <div v-for="i in healthValue" :key="i" />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.training-enemy {
  --damage-flash-step-dur: v-bind('(DAMAGE_FLASH_DURATION_MS / 3) + "ms"');
  --enemy-shrink-dur: v-bind('ENEMY_SHRINK_DURATION_MS + "ms"');
  @include styles.enemy-block();
}
</style>
