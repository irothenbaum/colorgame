import { defineStore } from 'pinia'
import {ref, computed, watch} from 'vue'
import {PlayState, Scene, EnemyType} from '@/types/gameTypes.ts'
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

  // watch for game end
  watch(() => worldState.value?.killedEnemyIds, (ids) => {
    if (!ids || ids.length === 0) {
      return
    }
    // if we've killed as many enemies as we have spawned, the level must be over
    if (ids.length === Object.keys(worldState.value!.enemiesLookup).length) {
      worldState.value!.playState = PlayState.Won
    }
  })

  on(EventType.LevelLost, () => {
    worldState.value!.playState = PlayState.Lost
  })

  on(EventType.TogglePause, (nowPaused) => {
    console.log("TOGGLING PAUSE " + nowPaused)
    // can only toggle pause if paused or playing
    if (!worldState.value || ![PlayState.Paused, PlayState.Playing].includes(worldState.value.playState)) {
      return
    }

    worldState.value.playState = nowPaused ? PlayState.Paused : PlayState.Playing
  })

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
      killedEnemyIds: worldState.value.killedEnemyIds,
      shotsFired: worldState.value.shotsFired,
      totalWaste: worldState.value.totalWaste,
      totalEnemies: worldState.value.totalEnemies,
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
      shotsFired: 0,
      totalWaste: 0,
      totalEnemies: level.enemies.filter(e => e.type !== EnemyType.Spacer).length,
      enemiesLookup: instantiateEnemies(level),
      playState: PlayState.Playing
    }
  }

  function fireShot(track: number, color: ColorValue): FireResult {
    worldState.value!.shotsFired++

    const retVal: FireResult = {
      struckEnemy: true,
      projectile: color,
      track: track,
    }

    const firstEnemy = Object.values(worldState.value!.enemiesLookup).filter(
      e => e.track === track
        && !worldState.value!.killedEnemyIds.includes(e.id)
        && getValueFromColor(e.healthRemaining) > 0
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
      const shrapnelValue = getValueFromColor(retVal.shrapnel)

      if (shrapnelValue === 0) {
        // shot is fully absorbed, no shrapnel
        retVal.damageDone = color
        delete retVal.shrapnel
      } else {
        // shot is partially absorbed, shrapnel is what's left of the shot, and damage done is the difference between the original shot and the shrapnel
        worldState.value!.totalWaste += shrapnelValue
        retVal.damageDone = collideColors(color, retVal.shrapnel)
      }

      if (retVal.debris) {
        worldState.value!.enemiesLookup[firstEnemy.id].healthRemaining = retVal.debris
      } else {
        // Enemy is destroyed — zero out health immediately so the next shot targets the next enemy,
        // but don't add to killedEnemyIds yet (that happens after the animation via EnemyDestroyed)
        worldState.value!.enemiesLookup[firstEnemy.id].healthRemaining = {red: 0, green: 0, blue: 0}
      }
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
