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
  startLevel: (level: LevelDefinition) => void
  startGame: () => void
  endGame: () => void
  endLevel: () => void
  fireShot: (track: number, color: ColorValue) => FireResult
  togglePause: (nowPaused?: boolean) => void
}

export const useGameStore = defineStore('game', (): GameStore => {
  const scene = ref<Scene>(Scene.MENU)
  const results = ref<GameState['results']>([])
  const currentLevel = ref<GameState['currentLevel']>(undefined)
  const levelState = ref<GameState['levelState']>(undefined)
  const levelsCompleted = computed<GameState['levelsCompleted']>(() => results.value.length)
  const {broadcast, on} = useEvents()

  // watch for game end
  watch(() => levelState.value?.killedEnemyIds, (ids) => {
    if (!ids || ids.length === 0) {
      return
    }
    // if we've killed as many enemies as we have spawned, the level must be over
    if (ids.length === Object.keys(levelState.value!.enemiesLookup).length) {
      levelState.value!.playState = PlayState.Won
    }
  }, {deep: true})

  on(EventType.LevelLost, () => {
    levelState.value!.playState = PlayState.Lost
  })

  function togglePause(nowPaused?:boolean) {
    // can only toggle pause if paused or playing
    if (!levelState.value || ![PlayState.Paused, PlayState.Playing].includes(levelState.value.playState)) {
      return
    }

    if (typeof nowPaused !== 'boolean') {
      nowPaused = levelState.value.playState === PlayState.Playing
    }

    console.log("TOGGLING PAUSE " + nowPaused)
    levelState.value.playState = nowPaused ? PlayState.Paused : PlayState.Playing
  }
  on(EventType.EnemyDestroyed, (payload: EventPayload[EventType.EnemyDestroyed]) => {
    if (!levelState.value) return
    levelState.value.killedEnemyIds.push(payload.enemyId)
  }) // to trigger reactivity in tests when we call fireShot and update levelState.enemiesLookup

  const playerStore = usePlayerStore()

  function startGame() {
    // TODO: Should this take GameSettings as input?
    // reset props
    scene.value = Scene.PLAY
    results.value = []
    currentLevel.value = undefined
    levelState.value = undefined
  }

  function endLevel() {
    if (!currentLevel.value || !levelState.value) return

    // Save result
    results.value.push({
      levelId: currentLevel.value.id,
      score: levelState.value.score,
      maxCombo: levelState.value.maxCombo,
      killedEnemyIds: levelState.value.killedEnemyIds,
      shotsFired: levelState.value.shotsFired,
      totalWaste: levelState.value.totalWaste,
      totalEnemies: levelState.value.totalEnemies,
    })

    // Clear current level and world state
    currentLevel.value = undefined
    levelState.value = undefined
  }

  function startLevel(level: LevelDefinition) {
    // Load level from levels file, set currentLevel and levelState
    currentLevel.value = {
      ...level
    }

    playerStore.prepareNewLevel() // reset player reloads at the start of each level

    levelState.value = {
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
    levelState.value!.shotsFired++

    const retVal: FireResult = {
      struckEnemy: true,
      projectile: color,
      track: track,
    }

    const firstEnemy = Object.values(levelState.value!.enemiesLookup).filter(
      e => e.track === track
        && !levelState.value!.killedEnemyIds.includes(e.id)
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
        levelState.value!.totalWaste += shrapnelValue
        retVal.damageDone = collideColors(color, retVal.shrapnel)
      }

      if (retVal.debris) {
        levelState.value!.enemiesLookup[firstEnemy.id].healthRemaining = retVal.debris
      } else {
        // Enemy is destroyed — zero out health immediately so the next shot targets the next enemy,
        // but don't add to killedEnemyIds yet (that happens after the animation via EnemyDestroyed)
        levelState.value!.enemiesLookup[firstEnemy.id].healthRemaining = {red: 0, green: 0, blue: 0}
      }
    } else {
      retVal.struckEnemy = false
      retVal.shrapnel = color // 100% shrapnel if it misses entirely
    }

    broadcast(EventType.ShotFired, retVal)

    return retVal
  }

  function endGame() {
    console.log("END GAME")
    scene.value = Scene.MENU
  }

  return {
    scene,
    results,
    levelsCompleted,
    currentLevel,
    levelState,

    // actions
    startLevel,
    fireShot,
    startGame,
    endLevel,
    endGame,
    togglePause
  }
})
