import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {type GameState, Scene} from '@/types/gameTypes.ts'
import type { Reactive } from '@/types/utilityTypes.ts'
import { usePlayerStore } from '@/stores/playerStore.ts'


export interface GameStore extends Reactive<GameState> {
  instantiateLevel: (levelId: string) => void
  startGame: () => void
}

export const useGameStore = defineStore('game', (): GameStore => {
  const scene = ref<Scene>(Scene.MENU)
  const results = ref<GameState['results']>([])
  const currentLevel = ref<GameState['currentLevel']>(undefined)
  const worldState = ref<GameState['worldState']>(undefined)
  const currentLevelId = ref<GameState['currentLevelId']>(undefined)
  const completedLevels = computed<GameState['completedLevels']>(() => results.value.length)

  const playerStore = usePlayerStore()

  function startGame() {
    // TODO: Should this take GameSettings as input?
    // reset props
    scene.value = Scene.PLAY
    results.value = []
    currentLevelId.value = undefined
    currentLevel.value = undefined
    worldState.value = undefined

  }

  function instantiateLevel(levelId: string) {
    // Load level from levels file, set currentLevel and worldState
    currentLevelId.value = levelId
    currentLevel.value = {
      id: levelId,
      enemies: [], // TODO: load actual enemies from level data
      trackCount: 1 // TODO: load from level data
    }

    playerStore.prepareNewLevel() // reset player reloads at the start of each level

    worldState.value = {
      level: currentLevel.value,
      levelId,
      score: 0,
      maxCombo: 0,
      spawnStep: 0
    }
  }

  return {
    scene,
    results,
    completedLevels,
    currentLevel,
    currentLevelId,
    worldState,

    // actions
    instantiateLevel,
    startGame
  }
})
