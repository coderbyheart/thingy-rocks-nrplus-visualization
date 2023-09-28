import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { pointAngle } from './pointAngle.ts'
import { Coordinates } from './layouter.ts'

Deno.test('pointAngle()', async (t) => {
  for (
    const [point1, point2, expectedAngle] of [
      [[0, 0], [0, 0], 0],
      [[0, 0], [1, 0], 0],
      [[0, 0], [0, 1], 90],
      [[0, 0], [0, -1], -90],
      [[0, 0], [-1, 0], 180],
      [[0, 0], [1, 1], 45],
      [[0, 0], [-1, 1], 135],
      [[0, 0], [-1, -1], -135],
    ] as [
      Coordinates,
      Coordinates,
      number,
    ][]
  ) {
    await t.step(
      `it should calculate the distance between the points ${point1} and ${point2} to be ${expectedAngle}`,
      () => {
        assertEquals(pointAngle(point1, point2), expectedAngle)
      },
    )
  }
})
