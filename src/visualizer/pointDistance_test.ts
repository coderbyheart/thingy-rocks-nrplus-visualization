import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { pointDistance } from './pointDistance.ts'
import { Coordinates } from './layouter.ts'

Deno.test('pointDistance()', async (t) => {
  for (
    const [point1, point2, expectedDistance] of [
      [[0, 0], [0, 0], 0],
      [[0, 0], [1, 0], 1],
      [[1, 0], [-1, 0], 2],
      [[0, 0], [1, 1], Math.sqrt(2)],
      [[0, 0], [-1, -1], Math.sqrt(2)],
    ] as [
      Coordinates,
      Coordinates,
      number,
    ][]
  ) {
    await t.step(
      `it should calculate the distance between the points ${point1} and ${point2} to be ${expectedDistance}`,
      () => {
        assertEquals(pointDistance(point1, point2), expectedDistance)
      },
    )
  }
})
