<script setup lang="ts">
import {computed} from 'vue'
import type {LevelDefinition, LevelScoreView} from '@/types/gameTypes.ts'
import {ContrastColor, darkenColor, getContrastColor} from '@/helpers/colorUtils.ts'

const props = defineProps<{
  level: LevelDefinition
  highScore: LevelScoreView | null
}>()
const emit = defineEmits<{
  play: [levelId: string]
}>()

const backgroundColor = computed<string>(() => props.level.color || 'var(--color-white)')
const textColor = computed<string>(() => getContrastColor(backgroundColor.value))
const buttonColor = computed<string>(() => darkenColor(backgroundColor.value, 0.3))
const buttonTextColor = computed<string>(() =>
  textColor.value === ContrastColor.white ? ContrastColor.black : ContrastColor.white,
)

function formatScore(val: number): string {
  return (val === 100 ? '100' : val.toFixed(1)) + '%'
}
</script>

<template>
  <div class="level-card" :style="{backgroundColor, color: textColor}">
    <h3>{{ level.name }}</h3>
    <p>{{ level.description }}</p>

    <div class="scores">
      <template v-if="highScore">
        <div class="score-row">
          <span class="score-label">All-time best</span>
          <span class="score-value">{{ formatScore(highScore.allTimeBest) }}</span>
        </div>
        <div class="score-row">
          <span class="score-label">Today's best</span>
          <span class="score-value">{{ highScore.todayBest !== null ? formatScore(highScore.todayBest) : '—' }}</span>
        </div>
      </template>
      <span v-else class="never-played">Never played</span>
    </div>

    <button :style="{backgroundColor: buttonColor, color: buttonTextColor}" @click="emit('play', level.id)">
      Play
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.level-card {
  height: 100%;
  width: 100%;
  @include styles.flex-column();
  justify-content: center;

  h3 {
    font-size: var(--font-size-xl);
  }

  p {
    font-style: italic;
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
      opacity: 0.85;

      .score-value {
        font-weight: bold;
        font-size: var(--font-size-md);
      }
    }

    .never-played {
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.6;
    }
  }

  button {
    color: inherit;
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
