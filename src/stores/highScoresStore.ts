import {defineStore} from 'pinia'
import {ref, watch} from 'vue'
import type {HighScoresData, LevelResult, LevelScoreView} from '@/types/gameTypes.ts'
import {STORAGE_KEY} from '@/constants/environment.ts'


function now(): string {
  return new Date().toISOString()
}

function isSameCalendarDay(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 10) === isoB.slice(0, 10)
}

function computeScorePercent(result: Pick<LevelResult, 'totalEnemies' | 'shotsFired' | 'totalWaste'>): number {
  const denominator = result.shotsFired + result.totalWaste
  if (denominator === 0) return 100
  return Math.min(100, (result.totalEnemies / denominator) * 100)
}

function loadFromStorage(): HighScoresData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {levels: {}}
}

export const useHighScoresStore = defineStore('highScores', () => {
  const data = ref<HighScoresData>(loadFromStorage())

  watch(data, val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, {deep: true})

  function recordResult(result: LevelResult) {
    const score = computeScorePercent(result)
    const existing = data.value.levels[result.levelId]
    const lastPlay = {score, date: now()}

    const prevBest = existing?.allTimeBest.score ?? 0
    const allTimeBest = !existing || score > prevBest ? lastPlay : existing.allTimeBest

    const isSameDay = !!existing && isSameCalendarDay(existing.todayBest.date, lastPlay.date)
    const prevTodayBest = isSameDay ? existing!.todayBest.score : 0
    const todayBest = !isSameDay || score > prevTodayBest ? lastPlay : existing!.todayBest

    data.value.levels[result.levelId] = {allTimeBest, todayBest, lastPlay}
  }

  function getLevelScores(levelId: string): LevelScoreView | null {
    const entry = data.value.levels[levelId]
    if (!entry) return null

    return {
      allTimeBest: entry.allTimeBest.score,
      todayBest: isSameCalendarDay(entry.todayBest.date, now()) ? entry.todayBest.score : null,
    }
  }

  return {data, recordResult, getLevelScores}
})
