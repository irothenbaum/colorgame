<script setup lang="ts">
import {computed, onUnmounted, ref} from 'vue'
import {useMenuStore} from '@/stores/menuStore.ts'
import {useHighScoresStore} from '@/stores/highScoresStore.ts'
import {Scene} from '@/types/menuTypes.ts'
import {useInterval} from '@/composables/useInterval.ts'

const menuStore = useMenuStore()
const highScoresStore = useHighScoresStore()

const todayStr = new Date().toISOString().slice(0, 10)

const displayDate = new Date(todayStr + 'T12:00:00Z').toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function getTimeUntilMidnight(): string {
  const now = new Date()
  const midnight = new Date()
  midnight.setUTCHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const countdown = ref(getTimeUntilMidnight())
const interval = useInterval(() => {
  countdown.value = getTimeUntilMidnight()
}, 1000)

onUnmounted(() => {
  interval.cancel()
})

const dailyId = `daily-${todayStr}`
const scores = computed(() => highScoresStore.getLevelScores(dailyId))
const todayScore = computed(() => scores.value?.todayBest ?? null)
const streak = computed(() => highScoresStore.getDailyStreak())

function formatScore(val: number | null): string {
  if (val === null) {
    return '—'
  }
  return (val === 100 ? '100' : val.toFixed(1)) + '%'
}
</script>

<template>
  <div class="daily-card">
    <h3>Daily Challenge</h3>
    <p class="date">{{ displayDate }}</p>

    <div class="stats">
      <div class="stat-row">
        <span class="stat-label">Today's score</span>
        <span class="stat-value" :class="{unplayed: todayScore === null}">{{ formatScore(todayScore) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Streak</span>
        <span class="stat-value">{{ streak }} {{ streak === 1 ? 'day' : 'days' }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Resets in</span>
        <span class="stat-value countdown">{{ countdown }}</span>
      </div>
    </div>

    <button @click="menuStore.goToScene(Scene.DAILY)">
      {{ todayScore !== null ? 'Play Again' : 'Play' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.daily-card {
  @include styles.level-card();

  h3 {
    font-size: var(--font-size-xl);
  }

  .date {
    font-size: var(--font-size-sm);
    opacity: 0.5;
    margin-top: var(--space-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .stats {
    margin-top: var(--space-md);
    @include styles.flex-column(var(--space-xs));
    width: 100%;
    max-width: 240px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-sm);
    font-size: var(--font-size-sm);
  }

  .stat-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.6;
  }

  .stat-value {
    font-weight: bold;
    font-size: var(--font-size-md);

    &.unplayed {
      opacity: 0.3;
      font-weight: normal;
    }

    &.countdown {
      font-family: monospace;
      font-size: var(--font-size-sm);
    }
  }

  button {
    margin-top: var(--space-lg);
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-size-xl);
    border: 0;
    border-radius: var(--border-radius-md);
    background: var(--color-text);
    color: var(--color-white);
    @include styles.drop-shadow();
  }
}
</style>
