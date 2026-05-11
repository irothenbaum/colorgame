<script setup lang="ts">
import {computed} from 'vue'
import {useGameStore} from '@/stores/gameStore'
import {storeToRefs} from 'pinia'
import {Scene} from '@/types/gameTypes'

const gameStore = useGameStore()
const {results, scene} = storeToRefs(gameStore)

const lastResult = computed(() => results.value[results.value.length - 1])

const shotsFired = computed(() => lastResult.value?.shotsFired ?? 0)
const totalWaste = computed(() => lastResult.value?.totalWaste ?? 0)
const totalEnemies = computed(() => lastResult.value?.totalEnemies ?? 0)

const scorePercent = computed(() => {
  const denominator = shotsFired.value + totalWaste.value
  if (denominator === 0) return 100
  return Math.min(100, (totalEnemies.value / denominator) * 100)
})

const scoreDisplay = computed(() => scorePercent.value.toFixed(1) + '%')

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
</script>

<template>
  <div class="results-overlay">
    <div class="results-modal">
      <h1>Results</h1>

      <div class="stats">
        <div class="stat-row">
          <span class="stat-label">Enemies</span>
          <span class="stat-value">{{ totalEnemies }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Shots Fired</span>
          <span class="stat-value">{{ shotsFired }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Wasted</span>
          <span class="stat-value">{{ totalWaste }}</span>
        </div>
      </div>

      <div class="score">
        <div class="score-percent">{{ scoreDisplay }}</div>
        <div class="score-grade" :class="gradeClass">{{ letterGrade }}</div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" @click="gameStore.startGame()">Play Again</button>
        <button class="btn btn-primary" @click="scene = Scene.MENU">Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.results-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  @include styles.flex-column();
  justify-content: center;
  z-index: 100;
}

.results-modal {
  background: var(--color-near-white);
  color: var(--color-near-black);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
  @include styles.flex-column(var(--space-lg));
  @include styles.drop-shadow(12px, 0.4);
  width: min(420px, 90vw);

  h1 {
    font-size: var(--font-size-xxl);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
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
  border-bottom: 1px solid var(--color-light-grey);
  padding-bottom: var(--space-xs);

  .stat-label {
    font-size: var(--font-size-lg);
    color: var(--color-dark-grey);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    font-size: var(--font-size-xl);
    font-weight: bold;
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
    @include styles.text-shadow(4px, 0.2);

    &.grade-a { color: #22aa44; }
    &.grade-b { color: #66aa22; }
    &.grade-c { color: #ccaa00; }
    &.grade-d { color: #cc6600; }
    &.grade-f { color: #cc2222; }
  }
}

.actions {
  @include styles.flex-row(var(--space-md));
  width: 100%;
  justify-content: center;
}

.btn {
  flex: 1;
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-family: inherit;
  font-size: var(--font-size-lg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  @include styles.drop-shadow();

  &.btn-primary {
    background: var(--color-near-black);
    color: var(--color-near-white);
  }

  &.btn-secondary {
    background: var(--color-light-grey);
    color: var(--color-near-black);
  }
}
</style>
