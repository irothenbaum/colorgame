import type {LevelDefinition} from '@/types/gameTypes'
import level1 from '@/levels/level1.json'
import level2 from '@/levels/level2.json'
import level3 from '@/levels/level3.json'
import level4 from '@/levels/level4.json'

function getColorForLevel(levelId: string): string {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5']
  const index = Math.abs(levelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length
  return colors[index]
}

export function loadAllLevels(): LevelDefinition[] {
  return [
    level1 as LevelDefinition,
    level2 as LevelDefinition,
    level3 as LevelDefinition,
    level4 as LevelDefinition,
  ].map( l => ({
    ...l,
    tracks: Math.max(l.tracks || 1),
    color: l.color || getColorForLevel(l.id)
  }))
}
