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
  const levelsCompleted = computed<GameState['levelsCompleted']>(() => results.value.length)

  const playerStore = usePlayerStore()

  function startGame() {
    // TODO: Should this take GameSettings as input?
    // reset props
    scene.value = Scene.PLAY
    results.value = []
    currentLevel.value = undefined
    worldState.value = undefined

  }

  function instantiateLevel(levelId: string) {
    // Load level from levels file, set currentLevel and worldState
    currentLevel.value = {
      id: levelId,
      name: "",
      description: "",
      enemies: [], // TODO: load actual enemies from level data
      tracks: 1 // TODO: load from level data
    }

    playerStore.prepareNewLevel() // reset player reloads at the start of each level

    worldState.value = {
      levelId,
      score: 0,
      maxCombo: 0,
      enemiesKilled: [],
      enemiesLookup: {}, // TODO: populate with initial enemies based on level data
      leadEnemies: [], // TODO: populate based on initial enemy positions
      spawnStep: 0
    }
  }

  return {
    scene,
    results,
    levelsCompleted,
    currentLevel,
    worldState,

    // actions
    instantiateLevel,
    startGame
  }
})
