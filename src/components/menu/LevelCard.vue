<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue'
import type {LevelDefinition, LevelScoreView} from '@/types/gameTypes.ts'
import {ContrastColor, darkenColor, getContrastColor} from '@/helpers/colorUtils.ts'
import {STAR, CHECK, TROPHY, CALENDAR, LOCK} from '@/constants/icons.ts'
import {useGameStore} from '@/stores/gameStore.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'
import LevelCardAccentBar from '@/components/LevelCardAccentBar.vue'
import Modal from '@/components/utility/Modal.vue'

const props = withDefaults(
  defineProps<{
    level: LevelDefinition
    highScore: LevelScoreView | null
    rank?: number
  }>(),
  {
    rank: 0,
  },
)

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

interface Badge {
  icon: string
  title: string
  description: string
  earned: boolean
}

const badges = computed<Badge[]>(() => [
  {
    icon: CALENDAR,
    title: 'Played Today',
    description: 'Earned by playing this level at least once today.',
    earned: playedToday.value,
  },
  {
    icon: TROPHY,
    title: 'Perfect Score',
    description: 'Earned by scoring a perfect 100% on this level.',
    earned: isPerfect.value,
  },
  {
    icon: STAR,
    title: "Today's High Score",
    description: "Earned when today's best score matches your all-time best.",
    earned: todayIsHighScore.value,
  },
])

const growingBadgeIndex = ref<number | null>(null)
const activeBadge = ref<Badge | null>(null)
const showBadgePopup = ref(false)
let popupTimeout: ReturnType<typeof setTimeout> | undefined

function onBadgeClick(badge: Badge, index: number) {
  clearTimeout(popupTimeout)
  growingBadgeIndex.value = index
  popupTimeout = setTimeout(() => {
    activeBadge.value = badge
    showBadgePopup.value = true
  }, 200)
}

function closeBadgePopup() {
  clearTimeout(popupTimeout)
  showBadgePopup.value = false
  growingBadgeIndex.value = null
}

onBeforeUnmount(() => {
  clearTimeout(popupTimeout)
})

function formatScore(val: number | null): string {
  if (val === null) return '—'
  return (val === 100 ? '100' : val.toFixed(1)) + '%'
}

const thumbnailWidth = ref<number | null>(null)

function onThumbnailLoad(e: Event) {
  const img = e.target as HTMLImageElement
  thumbnailWidth.value = (props.level.width ?? img.naturalWidth) * 4
}

function handlePlay() {
  gameStore.startLevel(props.level)
  menuStore.goToScene(Scene.PLAY_LEVEL)
}
</script>

<template>
  <div class="level-card">
    <LevelCardAccentBar :color="accentColor" :rank="rank" />

    <h3>{{ level.name }}</h3>
    <p>{{ level.description }}</p>
    <img
      v-if="level.thumbnail"
      :src="level.thumbnail"
      class="thumbnail"
      :style="thumbnailWidth ? {width: `${thumbnailWidth}px`} : {}"
      alt=""
      @load="onThumbnailLoad"
    />

    <div class="badges" :style="{'--badge-accent': accentColor}">
      <i
        v-for="(badge, index) in badges"
        :key="badge.title"
        :class="[badge.icon, {active: badge.earned, growing: growingBadgeIndex === index}]"
        :title="badge.title"
        @click="onBadgeClick(badge, index)"
      />
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

    <Modal :show="showBadgePopup" @close="closeBadgePopup">
      <template v-if="activeBadge">
        <div class="badge-popup-icon" :class="{earned: activeBadge.earned}" :style="{'--badge-accent': accentColor}">
          <i class="badge-icon" :class="activeBadge.icon" />
          <i v-if="!activeBadge.earned" class="lock-icon" :class="LOCK" />
        </div>
        <h4 class="badge-popup-title">{{ activeBadge.title }}</h4>
        <p class="badge-popup-description">{{ activeBadge.description }}</p>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.level-card {
  @include styles.level-card();

  .accent-bar {
    position: absolute;
    right: 0;
    top: 0;
    width: 0.7rem;
    height: 100%;
  }

  h3 {
    font-size: var(--font-size-xl);
  }

  p {
    font-style: italic;
  }

  .thumbnail {
    image-rendering: pixelated;
  }

  .badges {
    display: flex;
    gap: var(--space-lg);
    margin-top: var(--space-md);

    i {
      &.active:nth-child(2) {
        transform: scale(1.8);

        &.growing {
          transform: scale(2.6);
        }
      }

      font-size: var(--font-size-xl);
      opacity: 0.12;
      cursor: pointer;
      transition: transform 0.5s ease-out;

      &.active {
        opacity: 1;
        color: var(--badge-accent);
      }

      &.growing {
        transform: scale(1.5);
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

.badge-popup-title {
  font-size: var(--font-size-lg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-popup-description {
  opacity: 0.75;
}

.badge-popup-icon {
  position: relative;
  font-size: var(--hud-icon-size-lg);

  i.badge-icon {
    font-size: inherit;
    color: var(--color-shadow-light);
  }

  &.earned .badge-icon {
    color: var(--badge-accent);
  }

  .lock-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.7em;
    color: var(--color-dark-grey);
    opacity: 1;
  }
}
</style>
