import { Coordinates } from './layouter.ts'

export type BoundingBox = { width: number; height: number }
const asc = (a: number, b: number): number => a - b
export const boundingBox = (coordinates: Coordinates[]): BoundingBox => {
  const xAsc = coordinates.map(([x]) => x).sort(asc)
  const minX = xAsc[0]
  const maxX = xAsc[xAsc.length - 1]
  const yAsc = coordinates.map(([, y]) => y).sort(asc)
  const minY = yAsc[0]
  const maxY = yAsc[yAsc.length - 1]
  return ({
    width: maxX - minX,
    height: maxY - minY,
  })
}
