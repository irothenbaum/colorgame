import type { ColorValue } from './colorTypes'

export enum PlayState {
  Playing = 'playing',
  Paused = 'paused',
  Won = 'won',
  Lost = 'lost'
}

export enum EnemyType {
  Composite = 'composite',
  Atomic = 'atomic',
  Spacer = 'spacer',
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
  killedEnemyIds: string[] // string of enemy ids that have been killed already
  shotsFired: number
  totalWaste: number
  totalEnemies: number
  outcome: PlayState.Won | PlayState.Lost
}

export type FireResult = {
  struckEnemy: boolean
  struckEnemyId?: string
  track: number
  projectile: ColorValue
  damageDone?: ColorValue // how much health was taken off the enemy by the shot (basically the difference between projectile and shrapnel)
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

export interface LevelState extends Omit<LevelResult, 'outcome'> {
  enemiesLookup: Record<string, EnemyState>
  playState: PlayState
}

export interface GameState {
  results: Array<LevelResult>
  levelsCompleted: number // the count of results

  // these are all undefined if we're not in a level
  currentLevel: LevelDefinition | undefined
  levelState: LevelState | undefined
}

export interface ScoreEntry {
  score: number
  date: string  // ISO 8601 timestamp
}

// Per-level entry stored in localStorage
export interface LevelHighScore {
  allTimeBest: ScoreEntry
  todayBest: ScoreEntry
  lastPlay: ScoreEntry
}

export interface DailyStreakData {
  current: number
  lastPlayedDate: string  // YYYY-MM-DD (UTC)
}

// Full persisted blob
export interface HighScoresData {
  levels: Record<string, LevelHighScore>
  dailyStreak?: DailyStreakData
}

// View type passed to UI components
export interface LevelScoreView {
  allTimeBest: number | null  // null if never played
  todayBest: number | null  // null if not played today
}
