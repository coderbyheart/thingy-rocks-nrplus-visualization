import { Coordinates } from './layouter.ts'

export const pointEquals = (pointA: Coordinates, pointB: Coordinates): boolean =>
  pointA[0] === pointB[0] && pointA[1] === pointB[1]
