import { ColorType } from './colorTypes'

export type PlayerState = {
  [C in ColorType as `${C}Loaded` | `${C}Reload`]: number
} & {
  canFire: boolean
  activeTrack: number
}
