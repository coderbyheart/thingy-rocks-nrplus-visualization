import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { pointDirection } from './pointDirection.ts'
import { Coordinates } from './layouter.ts'

Deno.test('pointDirection()', async (t) => {
  for (
    const [point1, point2, expectedAngle] of [
      [[0, 0], [0, 0], 0],
      [[0, 0], [1, 0], 0],
      [[1, 0], [0, 0], Math.PI],
      [[0, 0], [0, 1], Math.PI / 2],
      [[0, 0], [0, -1], -Math.PI / 2],
      [[0, 0], [-1, 0], Math.PI],
      [[0, 0], [1, 1], Math.PI / 4],
      [[0, 0], [-1, 1], Math.PI * 3 / 4],
      [[0, 0], [-1, -1], -(Math.PI * 3 / 4)],
    ] as [
      Coordinates,
      Coordinates,
      number,
    ][]
  ) {
    await t.step(
      `it should calculate the angle between the points ${point1} and ${point2} to be ${expectedAngle}`,
      () => {
        assertEquals(pointDirection(point1, point2), expectedAngle)
      },
    )
  }
})
