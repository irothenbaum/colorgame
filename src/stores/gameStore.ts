import { defineStore } from 'pinia'
import {ref, computed, watch} from 'vue'
import {PlayState, EnemyType} from '@/types/gameTypes.ts'
import type {GameState, LevelDefinition, FireResult} from '@/types/gameTypes.ts'
import type { Reactive, } from '@/types/utilityTypes.ts'
import { usePlayerStore } from '@/stores/playerStore.ts'
import {applyShotToEnemy, instantiateEnemies} from '@/helpers/gameUtils.ts'
import type {ColorValue} from '@/types/colorTypes.ts'
import {collideColors, getValueFromColor} from '@/helpers/colorUtils.ts'
import {EventType, listen, broadcast, type EventPayload} from '@/composables/useEvents.ts'
import {useHighScoresStore} from '@/stores/highScoresStore.ts'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'

export interface GameStore extends Reactive<GameState> {
  startLevel: (level: LevelDefinition) => void
  endLevel: () => void
  endGame: () => void
  fireShot: (track: number, color: ColorValue) => FireResult
  togglePause: (nowPaused?: boolean) => void
}

export const useGameStore = defineStore('game', (): GameStore => {
  const results = ref<GameState['results']>([])
  const currentLevel = ref<GameState['currentLevel']>(undefined)
  const levelState = ref<GameState['levelState']>(undefined)
  const levelsCompleted = computed<GameState['levelsCompleted']>(() => results.value.length)
  listen(EventType.LevelLost, () => {
    recordCurrentLevelAsResult(PlayState.Lost)
  })

  listen(EventType.LevelWon, () => {
    recordCurrentLevelAsResult(PlayState.Won)
  })

  function recordCurrentLevelAsResult(state: PlayState.Won | PlayState.Lost) {
    if (!currentLevel.value || !levelState.value) {
      // this will never happen
      return
    }

    levelState.value!.playState = state

    // Save result
    const newResult = {
      levelId: currentLevel.value.id,
      killedEnemyIds: levelState.value.killedEnemyIds,
      shotsFired: levelState.value.shotsFired,
      totalWaste: levelState.value.totalWaste,
      totalEnemies: levelState.value.totalEnemies,
      outcome: state,
    }
    results.value = [...results.value, newResult]
    highScoresStore.recordResult(newResult)
  }

  function togglePause(nowPaused?:boolean) {
    // can only toggle pause if paused or playing
    if (!levelState.value || ![PlayState.Paused, PlayState.Playing].includes(levelState.value.playState)) {
      return
    }

    if (typeof nowPaused !== 'boolean') {
      nowPaused = levelState.value.playState === PlayState.Playing
    }

    levelState.value.playState = nowPaused ? PlayState.Paused : PlayState.Playing
  }
  listen(EventType.EnemyDestroyed, (payload: EventPayload[EventType.EnemyDestroyed]) => {
    if (!levelState.value) {
      return
    }
    levelState.value.killedEnemyIds.push(payload.enemyId)
  }) // to trigger reactivity in tests when we call fireShot and update levelState.enemiesLookup

  const playerStore = usePlayerStore()
  const highScoresStore = useHighScoresStore()
  const menuStore = useMenuStore()

  function endGame() {
    currentLevel.value = undefined
    levelState.value = undefined
    results.value = []
    menuStore.goToScene(Scene.SCENE_SELECT)
  }

  function endLevel() {
    if (!currentLevel.value || !levelState.value) {
      return
    }

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

    const firstEnemy = Object.values(levelState.value!.enemiesLookup).filter(
      e => e.track === track
        && !levelState.value!.killedEnemyIds.includes(e.id)
        && getValueFromColor(e.healthRemaining) > 0
    )[0]

    const retVal = applyShotToEnemy(firstEnemy, color)

    // hydrate track
    retVal.track = track

    // track fire stats
    if (retVal.shrapnel) {
      const shrapnelValue = getValueFromColor(retVal.shrapnel)
      if (shrapnelValue > 0) {
        levelState.value!.totalWaste += shrapnelValue
      }
    }

    if (retVal.debris) {
      levelState.value!.enemiesLookup[firstEnemy.id].healthRemaining = retVal.debris
    } else {
      // Enemy is destroyed — zero out health immediately so the next shot targets the next enemy,
      // but don't add to killedEnemyIds yet (that happens after the animation via EnemyDestroyed)
      levelState.value!.enemiesLookup[firstEnemy.id].healthRemaining = {red: 0, green: 0, blue: 0}
    }

    broadcast(EventType.ShotFired, retVal)

    return retVal
  }

  return {
    results,
    levelsCompleted,
    currentLevel,
    levelState,

    // actions
    startLevel,
    fireShot,
    endLevel,
    endGame,
    togglePause
  }
})
