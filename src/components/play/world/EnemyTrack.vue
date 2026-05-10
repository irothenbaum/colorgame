<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed} from 'vue'
import {useGameStore} from '@/stores/gameStore.ts'
import type {EnemyState} from '@/types/gameTypes.ts'
import {VERTICAL_UNITS, DEFAULT_TIME_TO_REACH_BOTTOM_MS, DAMAGE_FLASH_DURATION_MS} from '@/constants/environment.ts'
import {useTimeout, type TimerHandle} from '@/composables/useInterval.ts'
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
const endGameTimer = ref<TimerHandle | null>(null)
const transitionDurationMS = ref<number>(0)
const maxTimeToReachBottom = computed<number>(() => DEFAULT_TIME_TO_REACH_BOTTOM_MS / props.speedMultiplier)

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

function currentVisualPosition(): number {
  if (!isMoving.value || transitionDurationMS.value === 0) return enemyTipPosition.value
  const msElapsed = endGameTimer.value ? endGameTimer.value.msElapsed() : 0
  const unitsRemaining = VERTICAL_UNITS - enemyTipPosition.value
  return enemyTipPosition.value + (msElapsed / transitionDurationMS.value) * unitsRemaining
}

function resumeMoving() {
  endGameTimer.value?.cancel()
  const tipPositionRatio = (VERTICAL_UNITS - enemyTipPosition.value) / VERTICAL_UNITS
  const delay = tipPositionRatio * maxTimeToReachBottom.value
  transitionDurationMS.value = delay
  endGameTimer.value = useTimeout(() => {
    console.log('GAME OVER: ENEMY HIT THE BOTTOM')
    // gameStore.endLevel()
  }, delay)
  isMoving.value = true
}

const {on} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.track !== props.trackIndex || !payload.struckEnemyId) return

  const amountStruck = getValueFromColor(payload.damageDone!)
  if (amountStruck === 0) return

  // Capture visual position before cancelling the timer
  const snappedPosition = Math.max(0, currentVisualPosition() - amountStruck)
  console.log('Snapping to position', snappedPosition)
  endGameTimer.value?.cancel()
  endGameTimer.value = null
  // Snap position and stop moving together so the browser paints the correct resting position.
  // resumeMoving must fire in a later frame so the browser has committed the snap before the
  // transition to translateY(100%) begins — otherwise both land in the same frame and the
  // track animates from the old bottom position instead of jumping up.
  enemyTipPosition.value = snappedPosition
  isMoving.value = false
  requestAnimationFrame(() => {
    useTimeout(resumeMoving, DAMAGE_FLASH_DURATION_MS)
  })
})

onMounted(() => {
  useTimeout(resumeMoving, 100)
})

onUnmounted(() => {
  endGameTimer.value?.cancel()
})

const styles = computed<CSSProperties>(() => {
  if (isMoving.value) {
    console.log('Moving with transition duration', transitionDurationMS.value)
    return {
      transform: `translateY(100%)`,
      transitionDuration: `${transitionDurationMS.value}ms`,
      transitionTimingFunction: 'linear',
    }
  } else {
    console.log('Not moving, snapping to position', enemyTipPosition.value, (100 * enemyTipPosition.value / VERTICAL_UNITS))
    return {
      transform: `translateY(${100 * enemyTipPosition.value / VERTICAL_UNITS}cqh)`,
      transitionDuration: `0s`,
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
  container-type: size;

  .enemies-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: -100%; // just off screen at the top
    transition: transform 30s linear;
    transition-duration: 30s; // default value, will be overridden by inline styles

    @include styles.flex-column(0);
    justify-content: flex-end;
  }
}
</style>
