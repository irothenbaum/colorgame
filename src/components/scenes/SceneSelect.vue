<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, nextTick} from 'vue'
import type {LevelDefinition} from '@/types/gameTypes.ts'
import {loadAllLevels} from '@/helpers/levelUtils.ts'
import {useHighScoresStore} from '@/stores/highScoresStore.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import LevelCard from '@/components/menu/LevelCard.vue'
import EndlessCard from '@/components/menu/EndlessCard.vue'
import DailyCard from '@/components/menu/DailyCard.vue'
import TrainingCard from '@/components/menu/TrainingCard.vue'
import LandingCard from '@/components/menu/LandingCard.vue'
import TutorialCard from '@/components/menu/TutorialCard.vue'

const levels: LevelDefinition[] = loadAllLevels()
const highScoresStore = useHighScoresStore()
const menuStore = useMenuStore()

const listEl = ref<HTMLElement | null>(null)
const activeLiIndex = ref<number>(3) // default to landing card to avoid flash

function liClass(index: number) {
  const diff = activeLiIndex.value - index
  return {
    'is-active': diff === 0,
    'is-before': diff > 0,
    'is-after': diff < 0,
    'is-neighbor': Math.abs(diff) === 1,
  }
}

function updateActiveIndex() {
  if (!listEl.value) return
  const center = listEl.value.scrollTop + listEl.value.clientHeight / 2
  let closestIdx = 0
  let closestDist = Infinity
  ;[...listEl.value.children].forEach((li, i) => {
    const el = li as HTMLElement
    const liCenter = el.offsetTop + el.clientHeight / 2
    const dist = Math.abs(liCenter - center)
    if (dist < closestDist) {
      closestDist = dist
      closestIdx = i
    }
  })
  activeLiIndex.value = closestIdx
}

onMounted(async () => {
  await nextTick()
  if (!listEl.value) return

  if (menuStore.sceneSelectScrollTop !== null) {
    listEl.value.scrollTop = menuStore.sceneSelectScrollTop
  } else {
    const landingCard = listEl.value.querySelector<HTMLElement>('.landing-card-item')
    if (landingCard) {
      const containerCenter = listEl.value.clientHeight / 2
      const itemCenter = landingCard.offsetTop + landingCard.clientHeight / 2
      listEl.value.scrollTop = itemCenter - containerCenter
    }
  }

  updateActiveIndex()
  listEl.value.addEventListener('scroll', updateActiveIndex, {passive: true})
})

onBeforeUnmount(() => {
  if (listEl.value) {
    menuStore.sceneSelectScrollTop = listEl.value.scrollTop
    listEl.value.removeEventListener('scroll', updateActiveIndex)
  }
})
</script>

<template>
  <ul class="scenes-container" ref="listEl">
    <li :class="liClass(0)">
      <h4>Endless</h4>
      <EndlessCard />
    </li>
    <li :class="liClass(1)">
      <h4>Daily</h4>
      <DailyCard />
    </li>
    <li :class="liClass(2)">
      <h4>Training</h4>
      <TrainingCard />
    </li>
    <li class="landing-card-item" :class="liClass(3)">
      <h4>Main Menu</h4>
      <LandingCard :is-active="activeLiIndex === 3" />
    </li>
    <li :class="liClass(4)">
      <h4>Tutorial</h4>
      <TutorialCard />
    </li>
    <li v-for="(l, i) in levels" v-bind:key="l.id" class="level-card-item" :class="liClass(5 + i)">
      <h4>{{ l.name }}</h4>
      <LevelCard :level="l" :high-score="highScoresStore.getLevelScores(l.id)" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../styles';

.scenes-container {
  padding: 10vh 0;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  li {
    height: 80vh;
    scroll-snap-align: center;
    position: relative;

    --peek-distance: 2.5vh;
    --peek-fade-duration: 1s;
    --peek-fade-delay: 3s;

    > h4 {
      position: absolute;
      left: 0;
      right: 0;
      text-align: center;
      font-size: var(--font-size-sm);
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      padding: 0 var(--space-md);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
      top: auto;
      bottom: auto;
      opacity: 0;
      transition-property: opacity;
      transition-duration: var(--peek-fade-duration, 0s);
      transition-delay: var(--peek-fade-delay, 0s);
      transition-timing-function: ease;
      z-index: 5;
    }

    &.is-active > h4 {
      opacity: 0;
      transition-delay: 0s;
      transition-duration: 0s;
    }

    &.is-neighbor > h4 {
      opacity: 1;
    }

    &.is-before > h4 {
      bottom: var(--peek-distance, auto);
    }

    &.is-after > h4 {
      top: var(--peek-distance, auto);
    }
  }
}
</style>
