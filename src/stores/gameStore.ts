import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {type EnemyState, Scene} from '@/types/gameTypes.ts'
import type {GameState, LevelDefinition, FireResult} from '@/types/gameTypes.ts'
import type { Reactive, } from '@/types/utilityTypes.ts'
import { usePlayerStore } from '@/stores/playerStore.ts'
import {instantiateEnemies} from '@/helpers/gameUtils.ts'
import type {ColorValue} from '@/types/colorTypes.ts'
import {collideColors} from '@/helpers/colorUtils.ts'


export interface GameStore extends Reactive<GameState> {
  instantiateLevel: (level: LevelDefinition) => void
  startGame: () => void
  endLevel: () => void
  fireShot: (track: number, color: ColorValue) => FireResult
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

  function endLevel() {
    if (!currentLevel.value || !worldState.value) return

    // Save result
    results.value.push({
      levelId: currentLevel.value.id,
      score: worldState.value.score,
      maxCombo: worldState.value.maxCombo,
      killedEnemyIds: worldState.value.killedEnemyIds
    })

    // Clear current level and world state
    currentLevel.value = undefined
    worldState.value = undefined

    // Go to results screen
    scene.value = Scene.RESULTS
  }

  function instantiateLevel(level: LevelDefinition) {
    // Load level from levels file, set currentLevel and worldState
    currentLevel.value = {
      ...level
    }

    playerStore.prepareNewLevel() // reset player reloads at the start of each level

    worldState.value = {
      levelId: level.id,
      score: 0,
      maxCombo: 0,
      killedEnemyIds: [],
      enemiesLookup: instantiateEnemies(level),
      spawnStep: 0
    }
  }

  function fireShot(track: number, color: ColorValue): FireResult {
    const firstEnemy = Object.values(worldState.value!.enemiesLookup).filter(
      e => e.track === track && !worldState.value!.killedEnemyIds.includes(e.id)
    )[0]

    if (!firstEnemy) {
      return {
        success: false,
      }
    }

    // what's left of the enemy after being hit by the shot
    const debris = collideColors(firstEnemy.healthRemaining, color)

    // what's left of the shot after hitting the enemy
    const shrapnel = collideColors(color, firstEnemy.healthRemaining)

    return {
      success: true,
      debris: debris,
      shrapnel: shrapnel,
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
    fireShot,
    startGame,
    endLevel
  }
})
