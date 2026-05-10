import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {type EnemyState, Scene} from '@/types/gameTypes.ts'
import type {GameState, LevelDefinition, FireResult} from '@/types/gameTypes.ts'
import type { Reactive, } from '@/types/utilityTypes.ts'
import { usePlayerStore } from '@/stores/playerStore.ts'
import {instantiateEnemies} from '@/helpers/gameUtils.ts'
import type {ColorValue} from '@/types/colorTypes.ts'
import {collideColors, getValueFromColor} from '@/helpers/colorUtils.ts'
import {EventType, useEvents, type EventPayload} from '@/composables/useEvents.ts'


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
  const {broadcast, on} = useEvents()

  on(EventType.EnemyDestroyed, (payload: EventPayload[EventType.EnemyDestroyed]) => {
    if (!worldState.value) return
    worldState.value.killedEnemyIds.push(payload.enemyId)
  }) // to trigger reactivity in tests when we call fireShot and update worldState.enemiesLookup

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
    }
  }

  function fireShot(track: number, color: ColorValue): FireResult {
    const retVal: FireResult = {
      struckEnemy: true,
      projectile: color,
      track: track,
    }

    const firstEnemy = Object.values(worldState.value!.enemiesLookup).filter(
      e => e.track === track && !worldState.value!.killedEnemyIds.includes(e.id)
    )[0]

    if (firstEnemy) {
      retVal.struckEnemyId = firstEnemy.id

      // what's left of the enemy after being hit by the shot
      retVal.debris = collideColors(firstEnemy.healthRemaining, color)

      if (getValueFromColor(retVal.debris) === 0) {
        delete retVal.debris // no debris if the enemy is destroyed
      }

      // what's left of the shot after hitting the enemy
      retVal.shrapnel = collideColors(color, firstEnemy.healthRemaining)

      if (getValueFromColor(retVal.shrapnel) === 0) {
        // shot is fully absorbed, no shrapnel
        retVal.damageDone = color
        delete retVal.shrapnel
      } else {
        // shot is partially absorbed, shrapnel is what's left of the shot, and damage done is the difference between the original shot and the shrapnel
        retVal.damageDone = collideColors(color, retVal.shrapnel)
      }

      if (retVal.debris) {
        // if the enemy is damaged but not destroyed, update its health in the world state
        worldState.value!.enemiesLookup[firstEnemy.id].healthRemaining = retVal.debris
      }
      // if no debris, enemy is destroyed — but we defer killedEnemyIds until the Enemy component
      // finishes its animation and broadcasts EnemyDestroyed
    } else {
      retVal.struckEnemy = false
      retVal.shrapnel = color // 100% shrapnel if it misses entirely
    }

    broadcast(EventType.ShotFired, retVal)

    return retVal
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
