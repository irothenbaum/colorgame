import type { ColorValue } from './colorTypes'

export enum EnemyType {
  Pixel = 'Pixel',
  // TODO: more types
}

export interface EnemyInformation {
  health: ColorValue
  type: EnemyType
}

export interface Position {
  x: number
  y: number
}

export interface EnemyState extends EnemyInformation {
  position: Position
}

export interface LevelResult {
  levelId: string
  score: number
  maxCombo: number
}

export interface LevelState {
  id: string
  enemies: Array<EnemyInformation>
}

export interface WorldState extends LevelResult {
  level: LevelState,
  spawnStep: number // the index of level.enemies we're on
}

export interface GameState {
  results: Array<LevelResult>
  completedLevels: number // the count of results

  // these are all undefined if we're not in a level
  currentLevel: LevelState | undefined
  currentLevelId: string | undefined
  worldState: WorldState | undefined
}


