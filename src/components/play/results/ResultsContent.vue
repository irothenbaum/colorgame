<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'

const emit = defineEmits<{
  (e: 'grade-shown'): void
}>()

const gameStore = useGameStore()
const {results} = storeToRefs(gameStore)

const lastResult = computed(() => results.value[results.value.length - 1])

const shotsFired = computed(() => lastResult.value?.shotsFired ?? 0)
const totalWaste = computed(() => lastResult.value?.totalWaste ?? 0)
const totalEnemies = computed(() => lastResult.value?.totalEnemies ?? 0)

const scorePercent = computed<number>(() => {
  const denominator = shotsFired.value + totalWaste.value
  if (denominator === 0) return 100
  return Math.min(100, (totalEnemies.value / denominator) * 100)
})

const letterGrade = computed(() => {
  const s = scorePercent.value
  if (s >= 97) return 'A+'
  if (s >= 93) return 'A'
  if (s >= 90) return 'A-'
  if (s >= 87) return 'B+'
  if (s >= 83) return 'B'
  if (s >= 80) return 'B-'
  if (s >= 77) return 'C+'
  if (s >= 73) return 'C'
  if (s >= 70) return 'C-'
  if (s >= 67) return 'D+'
  if (s >= 63) return 'D'
  if (s >= 60) return 'D-'
  return 'F'
})

const gradeClass = computed(() => {
  const s = scorePercent.value
  if (s >= 90) return 'grade-a'
  if (s >= 80) return 'grade-b'
  if (s >= 70) return 'grade-c'
  if (s >= 60) return 'grade-d'
  return 'grade-f'
})

const contentVisible = ref(false)
const enemiesStarted = ref(false)
const shotsStarted = ref(false)
const wasteStarted = ref(false)
const displayedEnemies = ref(0)
const displayedShots = ref(0)
const displayedWaste = ref(0)
const displayedScore = ref(0)
const gradeVisible = ref(false)

const scoreDisplay = computed<string>(() => {
  return `${Math.floor(Math.min(displayedScore.value, scorePercent.value))}%`
})

function animateCount(to: number, duration: number, onUpdate: (val: number) => void): Promise<void> {
  return new Promise(resolve => {
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      onUpdate(to * eased)
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

onMounted(async () => {
  // 1000ms initial pause (matches bg-fade-in animation-delay) + 400ms for bg to finish fading in
  await delay(1400)
  contentVisible.value = true

  // wait for slide-up transition to settle
  await delay(600)

  enemiesStarted.value = true
  await animateCount(totalEnemies.value, 800, v => (displayedEnemies.value = Math.round(v)))
  await delay(500)
  shotsStarted.value = true
  await animateCount(shotsFired.value, 800, v => (displayedShots.value = Math.round(v)))
  await delay(500)
  wasteStarted.value = true
  await animateCount(totalWaste.value, 800, v => (displayedWaste.value = Math.round(v)))

  await delay(500)
  await animateCount(scorePercent.value, 1000, v => (displayedScore.value = v))

  gradeVisible.value = true
  await delay(350)
  emit('grade-shown')
})
</script>

<template>
  <div class="results-content">
    <div class="main-content" :class="{visible: contentVisible}">
      <h1>Results</h1>

      <div class="stats">
        <div class="stat-row">
          <span class="stat-label">Enemies</span>
          <span class="stat-value" :class="{pending: !enemiesStarted}">{{
            enemiesStarted ? displayedEnemies : '-'
          }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Shots Fired</span>
          <span class="stat-value" :class="{pending: !shotsStarted}">{{ shotsStarted ? displayedShots : '-' }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Wasted</span>
          <span class="stat-value" :class="{pending: !wasteStarted}">{{ wasteStarted ? displayedWaste : '-' }}</span>
        </div>
      </div>

      <div class="score">
        <div class="score-percent">{{ scoreDisplay }}</div>
        <div class="score-grade" :class="[gradeClass, {'grade-visible': gradeVisible}]">{{ letterGrade }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

@keyframes grade-pop {
  from {
    opacity: 0;
    transform: scale(4) rotate(-20deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(10deg);
  }
}

.results-content {
  @include styles.flex-column();
  justify-content: center;
  z-index: 100;
  color: var(--color-text);
  padding: var(--space-lg);

  .main-content {
    @include styles.flex-column();
    width: 100%;
    opacity: 0;
    transform: translateY(var(--space-xxl));
    transition:
      opacity 0.5s ease-out,
      transform 0.5s ease-out;

    &.visible {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h1 {
    font-size: var(--font-size-xxl);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .stats {
    width: 100%;
    @include styles.flex-column(var(--space-sm));
  }

  .stat-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid var(--color-grey);
    padding-bottom: var(--space-xs);

    .stat-label {
      font-size: var(--font-size-lg);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: var(--font-size-xl);
      font-weight: bold;

      &.pending {
        opacity: 0.3;
      }
    }
  }

  .score {
    @include styles.flex-row(var(--space-lg));
    align-items: center;

    .score-percent {
      font-size: var(--font-size-xxl);
      font-weight: bold;
    }

    .score-grade {
      font-size: calc(var(--font-size-xxl) * 2);
      font-weight: bold;
      line-height: 1;
      opacity: 0;
      transform-origin: center center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      @include styles.text-shadow(4px, 0.2);

      &.grade-visible {
        animation: grade-pop 0.2s ease-in both;
      }

      &.grade-a {
        color: #22aa44;
      }
      &.grade-b {
        color: #66aa22;
      }
      &.grade-c {
        color: #ccaa00;
      }
      &.grade-d {
        color: #cc6600;
      }
      &.grade-f {
        color: #cc2222;
      }
    }
  }
}
</style>
