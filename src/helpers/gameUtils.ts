import type { LevelDefinition, EnemyDefinition, EnemyState, FireResult} from '../types/gameTypes';
import { EnemyType,  } from '../types/gameTypes';
import {v4 as uuid} from 'uuid';
import {collideColors, getValueFromColor} from '@/helpers/colorUtils.ts'
import {broadcast, EventType} from '@/composables/useEvents.ts'
import type {ColorValue} from '@/types/colorTypes.ts'

export function instantiateEnemy(enemyDef: EnemyDefinition, trackCount: number): EnemyState {
  return {
    ...enemyDef,
    id: uuid(),
    type: enemyDef.type || EnemyType.Pixel, // default to Pixel if type is not defined
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

export function applyShotToEnemy(enemy: EnemyState | undefined, projectile: ColorValue): FireResult {
  const retVal: FireResult = {
    struckEnemy: true,
    projectile: projectile,
    track: 0,
  }

  if (!enemy) {
    retVal.struckEnemy = false
    retVal.shrapnel = projectile // 100% shrapnel if it misses entirely
    return retVal
  }

  retVal.struckEnemyId = enemy.id

  // what's left of the enemy after being hit by the shot
  retVal.debris = collideColors(enemy.healthRemaining, projectile)

  if (getValueFromColor(retVal.debris) === 0) {
    delete retVal.debris // no debris if the enemy is destroyed
  }

  // what's left of the shot after hitting the enemy
  retVal.shrapnel = collideColors(projectile, enemy.healthRemaining)
  const shrapnelValue = getValueFromColor(retVal.shrapnel)

  if (shrapnelValue === 0) {
    // shot is fully absorbed, no shrapnel
    retVal.damageDone = projectile
    delete retVal.shrapnel
  } else {
    // shot is partially absorbed, shrapnel is what's left of the shot, and damage done is the difference between the original shot and the shrapnel
    retVal.damageDone = collideColors(projectile, retVal.shrapnel)
  }

  return retVal

}
