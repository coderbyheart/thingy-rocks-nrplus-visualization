import { pointDirection } from './pointDirection.ts'
import { Coordinates, Vector } from './layouter.ts'
import { pointDistance } from './pointDistance.ts'
import { getPos } from './getPos.ts'

export const vectorSum = (vectors: Vector[]): Vector =>
  vectors.reduce((result, vector) => {
    const resultPos = getPos(result)
    const vectorPos = getPos(vector)
    const newPos: Coordinates = [resultPos[0] + vectorPos[0], resultPos[1] + vectorPos[1]]
    const direction = pointDirection([0, 0], newPos)

    return {
      direction: direction > Math.PI ? -(Math.PI * 2 - direction) : direction,
      magnitude: pointDistance([0, 0], newPos),
    }
  }, {
    direction: 0,
    magnitude: 0,
  })
