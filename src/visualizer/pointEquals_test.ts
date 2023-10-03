import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { pointEquals } from './pointEquals.ts'
import { Coordinates } from './layouter.ts'

Deno.test('pointEquals()', async (t) => {
  for (
    const [point1, point2, isEqual] of [
      [[0, 0], [0, 0], true],
      [[-0, 0], [0, 0], true],
      [[1, 1], [1, 1], true],
      [[0, 0], [1, 0], false],
      [[1, 0], [-1, 0], false],
    ] as [
      Coordinates,
      Coordinates,
      boolean,
    ][]
  ) {
    await t.step(
      `it return that the equality of ${point1} and ${point2} is ${isEqual}`,
      () => {
        assertEquals(pointEquals(point1, point2), isEqual)
      },
    )
  }
})
