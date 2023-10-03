import { Vector } from './layouter.ts'

export const getPos = (
  v: Vector,
): [number, number] => [Math.cos(v.direction) * v.magnitude, Math.sin(v.direction) * v.magnitude]
