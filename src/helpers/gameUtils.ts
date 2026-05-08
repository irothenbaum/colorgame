import type { LevelDefinition, EnemyDefinition, EnemyState } from '../types/gameTypes';

import {v4 as uuid} from 'uuid';
import type {ColorValue} from '@/types/colorTypes.ts'

export function instantiateEnemy(enemyDef: EnemyDefinition, trackCount: number): EnemyState {
  return {
    ...enemyDef,
    id: uuid(),
    track: enemyDef.track !== undefined ? enemyDef.track % trackCount : Math.floor(Math.random() * trackCount), // assign track based on definition or randomly
    healthRemaining: enemyDef.health
  }
}

export function instantiateEnemies(level: LevelDefinition): Record<string, EnemyState> {
  const enemies: Record<string, EnemyState> = {}
  level.enemies.forEach(def => {
    const enemy = instantiateEnemy(def, level.tracks)
    enemies[enemy.id] = enemy
  })
  return enemies
}
