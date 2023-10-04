import { Coordinates } from './layouter.ts'

export const pointDirection = ([x1, y1]: Coordinates, [x2, y2]: Coordinates): number =>
  Math.atan2(y2 - y1, x2 - x1) % (Math.PI * 2)
