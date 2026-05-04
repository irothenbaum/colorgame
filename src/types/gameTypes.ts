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

export interface Position {
  x: number // the track number indexed at 0
  y: number // the vertical unit position (0 -> VERTICAL_UNITS)
}

export interface EnemyState extends EnemyDefinition {
  id: string
  position: Position
  healthRemaining: ColorValue
}

export interface LevelResult {
  levelId: string
  score: number
  maxCombo: number
  enemiesKilled: string[] // string of enemy ids that have been killed already
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
  leadEnemies: string[] // indexed by track number, the id of the current targetable enemy on each track (enemy with highest Y position)
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


