import {defineStore} from 'pinia'
import {ref, watch} from 'vue'
import type {HighScoresData, LevelResult, LevelScoreView} from '@/types/gameTypes.ts'
import {STORAGE_KEY} from '@/constants/environment.ts'


function todayString(): string {
  return new Date().toISOString().slice(0, 10)
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
    const today = todayString()
    const scorePercent = computeScorePercent(result)
    const existing = data.value.levels[result.levelId]
    const isSameDay = existing?.resultsDate === today

    data.value.levels[result.levelId] = {
      allTimeBest: Math.max(existing?.allTimeBest ?? 0, scorePercent),
      results: [...(isSameDay ? existing.results : []), scorePercent],
      resultsDate: today,
    }
  }

  function getLevelScores(levelId: string): LevelScoreView | null {
    const entry = data.value.levels[levelId]
    if (!entry) return null

    const isSameDay = entry.resultsDate === todayString()
    const todayResults = isSameDay ? entry.results : []

    return {
      allTimeBest: entry.allTimeBest,
      todayBest: todayResults.length > 0 ? Math.max(...todayResults) : null,
    }
  }

  return {data, recordResult, getLevelScores}
})
