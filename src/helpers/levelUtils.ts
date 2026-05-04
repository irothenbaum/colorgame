import type {LevelState} from '@/types/gameTypes'
import level1 from '@/levels/level1.json'

export function loadAllLevels(): LevelState[] {
  return [
    level1 as LevelState
  ]
}
