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
})

onBeforeUnmount(() => {
  if (listEl.value) {
    menuStore.sceneSelectScrollTop = listEl.value.scrollTop
  }
})
</script>

<template>
  <ul class="scenes-container" ref="listEl">
    <li>
      <EndlessCard />
    </li>
    <li>
      <DailyCard />
    </li>
    <li>
      <TrainingCard />
    </li>
    <li class="landing-card-item">
      <LandingCard />
    </li>
    <li>
      <TutorialCard />
    </li>
    <li v-for="l in levels" v-bind:key="l.id" class="level-card-item">
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
  }
}
</style>
