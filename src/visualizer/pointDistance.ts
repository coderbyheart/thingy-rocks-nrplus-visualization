import { Coordinates } from './layouter.ts'

export const pointDistance = ([x1, y1]: Coordinates, [x2, y2]: Coordinates): number =>
  Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
