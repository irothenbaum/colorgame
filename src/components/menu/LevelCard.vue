<script setup lang="ts">
import {computed} from 'vue'
import type {LevelDefinition, LevelScoreView} from '@/types/gameTypes.ts'
import {ContrastColor, darkenColor, getContrastColor} from '@/helpers/colorUtils.ts'
import {TIMER, STAR, CHECK} from '@/constants/icons.ts'
import {useGameStore} from '@/stores/gameStore.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'

const props = defineProps<{
  level: LevelDefinition
  highScore: LevelScoreView | null
}>()

const menuStore = useMenuStore()
const gameStore = useGameStore()
const accentColor = computed<string>(() => props.level.color || 'var(--color-grey)')
const buttonColor = computed<string>(() => darkenColor(accentColor.value, 0.3))
const buttonTextColor = computed<string>(() =>
  getContrastColor(buttonColor.value) === ContrastColor.white ? ContrastColor.white : ContrastColor.black,
)

const playedToday = computed(() => props.highScore?.todayBest != null)
const todayIsHighScore = computed(
  () => props.highScore?.todayBest != null && props.highScore.todayBest === props.highScore.allTimeBest,
)
const isPerfect = computed(() => props.highScore?.allTimeBest === 100)

function formatScore(val: number | null): string {
  if (val === null) return '—'
  return (val === 100 ? '100' : val.toFixed(1)) + '%'
}

function handlePlay() {
  gameStore.startLevel(props.level)
  menuStore.goToScene(Scene.PLAY_LEVEL)
}
</script>

<template>
  <div class="level-card" :style="{borderColor: accentColor}">
    <div class="accent-bar" :style="{backgroundColor: accentColor}" />

    <h3>{{ level.name }}</h3>
    <p>{{ level.description }}</p>

    <div class="badges" :style="{'--badge-accent': accentColor}">
      <i :class="['pi', TIMER, {active: playedToday}]" title="Played today" />
      <i :class="['pi', STAR, {active: todayIsHighScore}]" title="Today's high score" />
      <i :class="['pi', CHECK, {active: isPerfect}]" title="Perfect score (100%)" />
    </div>

    <div class="scores">
      <template v-if="highScore">
        <div class="score-row">
          <span class="score-label">All-time best</span>
          <span class="score-value">{{ formatScore(highScore.allTimeBest) }}</span>
        </div>
        <div class="score-row">
          <span class="score-label">Today's best</span>
          <span class="score-value">{{ formatScore(highScore.todayBest) }}</span>
        </div>
      </template>
      <span v-else class="never-played">Never played</span>
    </div>

    <button :style="{backgroundColor: buttonColor, color: buttonTextColor}" @click="handlePlay">Play</button>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.level-card {
  position: relative;
  height: 100%;
  width: 100%;
  background: var(--color-white);
  color: var(--color-text);
  @include styles.flex-column();
  justify-content: center;
  overflow: hidden;

  .accent-bar {
    position: absolute;
    right: 0;
    top: 0;
    width: 1rem;
    height: 100%;
  }

  h3 {
    font-size: var(--font-size-xl);
  }

  p {
    font-style: italic;
  }

  .badges {
    display: flex;
    gap: var(--space-lg);
    margin-top: var(--space-md);

    i {
      font-size: var(--font-size-xl);
      opacity: 0.12;

      &.active {
        opacity: 1;
        color: var(--badge-accent);
      }
    }
  }

  .scores {
    margin-top: var(--space-md);
    @include styles.flex-column(var(--space-xs));

    .score-row {
      display: flex;
      gap: var(--space-sm);
      align-items: baseline;
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.75;

      .score-value {
        font-weight: bold;
        font-size: var(--font-size-md);
      }
    }

    .never-played {
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.4;
    }
  }

  button {
    margin-top: var(--space-lg);
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-size-xl);
    border: 0;
    border-radius: var(--border-radius-md);
    @include styles.drop-shadow();
    @include styles.text-shadow;
  }
}
</style>
