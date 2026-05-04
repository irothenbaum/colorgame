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

export enum ContrastColor {
  black = 'var(--color-black)',
  white = 'var(--color-white)'
}

export function getContrastColor(hex:string):ContrastColor {
  const {r, g, b} = getColorsFromHex(hex)
  // relative luminance (WCAG), normalized to 0–1
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.35 ? ContrastColor.black : ContrastColor.white
}

export function darkenColor(hex:string, amount:number): string {
  const {r, g, b} = getColorsFromHex(hex)
  return getHexFromColors(
    r * (1 - amount),
    g * (1 - amount),
    b * (1 - amount),
  )
}

export function brightenColor(hex:string, amount:number): string {
  const {r, g, b} = getColorsFromHex(hex)
  return getHexFromColors(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  )
}

// Returns r, g, b as 0–255 integers
export function getColorsFromHex(hex:string): {r: number, g: number, b:number} {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

export function getHexFromColors(r: number, g: number, b: number): string {
  r = Math.round(Math.min(255, Math.max(0, r)))
  g = Math.round(Math.min(255, Math.max(0, g)))
  b = Math.round(Math.min(255, Math.max(0, b)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
