<script setup lang="ts">
import {watch, onMounted, onUnmounted, ref, computed} from 'vue'
import {useGameStore} from '@/stores/gameStore.ts'
import type {EnemyState} from '@/types/gameTypes.ts'
import {VERTICAL_UNITS, DEFAULT_TIME_TO_REACH_BOTTOM_MS, DAMAGE_FLASH_DURATION_MS} from '@/constants/environment.ts'
import type {CSSProperties} from 'vue'
import {storeToRefs} from 'pinia'
import Enemy from './Enemy.vue'
import {useEvents, EventType} from '@/composables/useEvents.ts'
import type {EventPayload} from '@/composables/useEvents.ts'
import {getValueFromColor} from '@/helpers/colorUtils.ts'

const props = withDefaults(
  defineProps<{
    trackIndex: number
    speedMultiplier?: number // How much faster/slower the track moves compared to the default speed
  }>(),
  {
    speedMultiplier: 1,
  },
)

const gameStore = useGameStore()
const {worldState} = storeToRefs(gameStore)
const isMoving = ref<boolean>(false)
const enemyTipPosition = ref<number>(0) // the distance of the furthest advanced enemy on the track.
const stepInterval = ref<number>(0)
const transitionDurationMS = ref<number>(0)

const enemiesOnTrack = computed<EnemyState[]>(() => {
  return Object.values(worldState.value!.enemiesLookup).filter(e => e.track === props.trackIndex)
})
const enemiesToKill = computed<EnemyState[]>(() => {
  return enemiesOnTrack.value.filter(e => !worldState.value!.killedEnemyIds.includes(e.id))
})
const spawnedEnemies = computed<EnemyState[]>(() => {
  // can't possibly be more than VERTICAL_UNITS enemies on the track at once, so we can just take that many at a time
  return enemiesToKill.value.slice(0, VERTICAL_UNITS).reverse()
})

const {on} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  console.log('shot fired event received in EnemyTrack', payload)
  if (payload.track !== props.trackIndex || !payload.struckEnemyId) {
    return
  }

  // we know damageDone is defined because the enemy was struck, but typescript doesn't
  const amountStruck = getValueFromColor(payload.damageDone!)

  enemyTipPosition.value = enemyTipPosition.value - amountStruck
  isMoving.value = false
  setTimeout(() => {
    isMoving.value = true
  }, DAMAGE_FLASH_DURATION_MS)
})

watch(
  [enemyTipPosition, isMoving],
  () => {
    // if we're not moving, we pause
    if (!isMoving.value) {
      clearInterval(stepInterval.value)
      return
    }

    // showing my work here but basically juts calculating when the tip would hit the bottom
    const tipPositionRatio = (VERTICAL_UNITS - enemyTipPosition.value) / VERTICAL_UNITS
    const maxTimeToReachBottom = DEFAULT_TIME_TO_REACH_BOTTOM_MS / props.speedMultiplier
    const delay = tipPositionRatio * maxTimeToReachBottom
    stepInterval.value = setInterval(() => {
      console.log('GAME OVER: ENEMY HIT THE BOTTOM')
      // gameStore.endLevel()
    }, delay)
    transitionDurationMS.value = delay
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  setTimeout(() => {
    // this ensures our inline styles can be applied
    isMoving.value = true
  }, 1000)
})

onUnmounted(() => {
  clearInterval(stepInterval.value)
})

const styles = computed<CSSProperties>(() => {
  console.log(isMoving.value, enemyTipPosition.value)
  if (isMoving.value) {
    return {
      transform: `translateY(100%)`,
      transitionDuration: transitionDurationMS.value + 'ms',
    }
  } else {
    return {
      transform: `translateY(${enemyTipPosition.value}cqh)`,
      transitionDuration: 0,
    }
  }
})
</script>

<template>
  <div class="enemy-track">
    <div class="enemies-container" :class="{moving: isMoving}" :style="styles">
      <Enemy v-for="e in spawnedEnemies" v-bind:key="e.id" :enemy="e" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.enemy-track {
  position: relative;
  height: 100%;
  width: 100%;
  background: var(--color-track-bg);

  .enemies-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: -100%; // just off screen at the top
    container-type: size;
    transition: transform 30s linear;
    transition-duration: 30s; // default value, will be overridden by inline styles

    @include styles.flex-column(0);
    justify-content: flex-end;
  }
}
</style>
