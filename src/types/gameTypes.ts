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

export interface EnemyInformation {
  health: ColorValue
  type: EnemyType
}

export interface Position {
  x: number // the track number indexed at 0
  y: number // the vertical unit position (0 -> VERTICAL_UNITS)
}

export interface EnemyState extends EnemyInformation {
  position: Position
  healthRemaining: ColorValue
}

export interface LevelResult {
  levelId: string
  score: number
  maxCombo: number
}

export interface LevelState {
  id: string
  enemies: Array<EnemyInformation>
  trackCount: number
}

export interface WorldState extends LevelResult {
  level: LevelState,
  spawnStep: number // the index of level.enemies we're on
}

export interface GameState {
  results: Array<LevelResult>
  scene: Scene
  completedLevels: number // the count of results

  // these are all undefined if we're not in a level
  currentLevel: LevelState | undefined
  currentLevelId: string | undefined
  worldState: WorldState | undefined
}


