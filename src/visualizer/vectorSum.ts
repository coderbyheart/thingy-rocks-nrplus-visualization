import { Coordinates, Vector } from './layouter.ts'

export const vectorSum = (vectors: Vector[]): Vector =>
  vectors.reduce((result, vector) => {
    const resultPos = getPos(result)
    const vectorPos = getPos(vector)
    const newPos: Coordinates = [resultPos[0] + vectorPos[0], resultPos[1] + vectorPos[1]]
    return {
      direction: getDirection(newPos),
      magnitude: getMagnitude(newPos),
    }
  }, {
    direction: 0,
    magnitude: 0,
  })

const getPos = (
  v: Vector,
): [number, number] => [Math.cos(v.direction) * v.magnitude, Math.sin(v.direction) * v.magnitude]

const getMagnitude = (pos: Coordinates) => Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1])

const getDirection = (pos: Coordinates) => Math.atan2(pos[1], pos[0])
