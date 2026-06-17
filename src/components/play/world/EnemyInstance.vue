<script setup lang="ts">
import {computed, ref, watchEffect} from 'vue'
import type {EnemyState} from '@/types/gameTypes.ts'
import {colorHealthToColor, getValueFromColor} from '@/helpers/colorUtils.ts'
import {VERTICAL_UNITS, DAMAGE_FLASH_DURATION_MS, ENEMY_SHRINK_DURATION_MS} from '@/constants/environment.ts'
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
const visualHeightCQH = ref<number | null>(null)
const displayHeightCQH = computed(() => visualHeightCQH.value ?? (healthValue.value * 100) / VERTICAL_UNITS)

const {on, broadcast} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.struckEnemyId !== props.enemy.id) return
  if (getValueFromColor(payload.damageDone!) === 0) return

  const targetHeightCQH = payload.debris ? (getValueFromColor(payload.debris) * 100) / VERTICAL_UNITS : 0

  visualHeightCQH.value = (healthValue.value * 100) / VERTICAL_UNITS
  isFlashing.value = true

  requestAnimationFrame(() => {
    visualHeightCQH.value = targetHeightCQH
    if (targetHeightCQH === 0) isDestroyed.value = true
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
      <span v-for="i in healthValue" :key="i" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.enemy-container {
  width: 100%;
  overflow: visible;
  position: relative;
  @include styles.drop-shadow();
}

.enemy {
  --damage-flash-step-dur: v-bind('(DAMAGE_FLASH_DURATION_MS / 3) + "ms"');
  @include styles.enemy-block();
  width: 100%;
  height: 100%;
  bottom: 0;
}
</style>
