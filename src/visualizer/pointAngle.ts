import { Coordinates } from './layouter.ts'

export const pointAngle = ([x1, y1]: Coordinates, [x2, y2]: Coordinates): number =>
  Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
