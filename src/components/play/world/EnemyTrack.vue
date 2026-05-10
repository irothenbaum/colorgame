<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed, watch} from 'vue'
import {useGameStore} from '@/stores/gameStore.ts'
import type {EnemyState} from '@/types/gameTypes.ts'
import {EnemyType} from '@/types/gameTypes.ts'
import {VERTICAL_UNITS, DEFAULT_TIME_TO_REACH_BOTTOM_MS, DAMAGE_FLASH_DURATION_MS} from '@/constants/environment.ts'
import {useTimeout, type TimerHandle} from '@/composables/useInterval.ts'
import type {CSSProperties} from 'vue'
import {storeToRefs} from 'pinia'
import Enemy from './Enemy.vue'
import Confetti from './Confetti.vue'
import {useEvents, EventType} from '@/composables/useEvents.ts'
import type {EventPayload} from '@/composables/useEvents.ts'
import {getValueFromColor} from '@/helpers/colorUtils.ts'
import {usePlayerStore} from '@/stores/playerStore.ts'

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
const playerStore = usePlayerStore()
const {worldState, currentLevel} = storeToRefs(gameStore)
const {activeTrack} = storeToRefs(playerStore)
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

function pauseAndResume(newPosition: number, pauseMs: number) {
  endGameTimer.value?.cancel()
  endGameTimer.value = null
  enemyTipPosition.value = newPosition
  isMoving.value = false
  requestAnimationFrame(() => {
    useTimeout(resumeMoving, pauseMs)
  })
}

const {on} = useEvents()

on(EventType.ShotFired, (payload: EventPayload[EventType.ShotFired]) => {
  if (payload.track !== props.trackIndex || !payload.struckEnemyId) return

  const amountStruck = getValueFromColor(payload.damageDone!)
  if (amountStruck === 0) return

  pauseAndResume(Math.max(0, currentVisualPosition() - amountStruck), DAMAGE_FLASH_DURATION_MS)
})

watch(
  () => spawnedEnemies.value[spawnedEnemies.value.length - 1],
  (leadEnemy) => {
    if (leadEnemy?.type === EnemyType.Spacer) {
      const position = Math.max(0, currentVisualPosition() - getValueFromColor(leadEnemy.healthRemaining))
      worldState.value!.killedEnemyIds.push(leadEnemy.id)
      pauseAndResume(position, 0)
    }
  },
)

onMounted(() => {
  useTimeout(resumeMoving, 100)
})

onUnmounted(() => {
  endGameTimer.value?.cancel()
})

const styles = computed<CSSProperties>(() => {
  if (isMoving.value) {
    return {
      transform: `translateY(100%)`,
      transitionDuration: `${transitionDurationMS.value}ms`,
      transitionTimingFunction: 'linear',
    }
  } else {
    return {
      transform: `translateY(${100 * enemyTipPosition.value / VERTICAL_UNITS}cqh)`,
      transitionDuration: `0s`,
    }
  }
})
</script>

<template>
  <div class="enemy-track" :class="{selected: trackIndex === activeTrack}" >
    <div class="enemies-container" :class="{moving: isMoving}" :style="styles">
      <Enemy v-for="e in spawnedEnemies" v-bind:key="e.id" :enemy="e" />
    </div>
    <Confetti v-if="spawnedEnemies.length === 0" :count-scale="currentLevel!.tracks" />
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
  padding: 0 var(--space-xs);
  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: var(--color-shadow-light);
    transition: opacity 0.3s ease-out;
  }

  &.selected {
    background: var(--color-track-selected-bg);
    &:after {
      opacity: 0;
    }
  }

  .enemies-container {
    position: absolute;
    left: var(--space-xs);
    width: calc(100% - 2 * var(--space-xs));
    height: 100%;
    top: -100%; // just off screen at the top
    transition: transform 30s linear;
    transition-duration: 30s; // default value, will be overridden by inline styles

    @include styles.flex-column(0);
    justify-content: flex-end;
  }
}
</style>
