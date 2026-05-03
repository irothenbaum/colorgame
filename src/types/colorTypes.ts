export enum ColorType {
  red = 'red',
  green = 'green',
  blue = 'blue'
}

export type ColorValue = {
  [K in ColorType]: number
}
