import type {ColorValue} from '@/types/colorTypes.ts'

export function colorHealthToColor(type: ColorValue): string {
  const totalValue = type.red + type.green + type.blue
  if (totalValue === 0) {
    return 'black'
  }

  const redPercent = type.red / totalValue
  const greenPercent = type.green / totalValue
  const bluePercent = type.blue / totalValue

  const redHex = Math.round(redPercent * 255).toString(16).padStart(2, '0')
  const greenHex = Math.round(greenPercent * 255).toString(16).padStart(2, '0')
  const blueHex = Math.round(bluePercent * 255).toString(16).padStart(2, '0')

  return `#${redHex}${greenHex}${blueHex}`
}
