import type { ColorValue } from './colorTypes'

export enum Scene {
  MENU = 'menu',
  PLAY = 'play',
  RESULTS = 'results',
}

export enum EnemyType {
  Pixel = 'pixel',
  // TODO: more types
}

export interface EnemyDefinition {
  health: ColorValue
  type: EnemyType
  track?: number
}

export interface EnemyState extends EnemyDefinition {
  id: string
  track: number // 0 = track 1, 1 = track 2, etc. (assigned when spawned)
  healthRemaining: ColorValue
}

export interface LevelResult {
  levelId: string
  score: number
  maxCombo: number
  killedEnemyIds: string[] // string of enemy ids that have been killed already
}

export type FireResult = {
  success: boolean
  debris?: ColorValue // what's left of the enemy after being hit by the shot
  shrapnel?: ColorValue // what's left of the shot after hitting the enemy
}


export interface LevelDefinition {
  id: string
  name: string
  description: string
  color?: string
  enemies: Array<EnemyDefinition>
  tracks: number
}

export interface WorldState extends LevelResult {
  enemiesLookup: Record<string, EnemyState> // enemies currently visible on the screen
  spawnStep: number // the index of level.enemies we're on
}

export interface GameState {
  results: Array<LevelResult>
  scene: Scene
  levelsCompleted: number // the count of results

  // these are all undefined if we're not in a level
  currentLevel: LevelDefinition | undefined
  worldState: WorldState | undefined
}
