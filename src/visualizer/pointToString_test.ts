import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { pointToString } from './pointToString.ts'
import { Coordinates } from './layouter.ts'

Deno.test('pointToString()', async (t) => {
  for (
    const [point1, stringRepresentation] of [
      [[0, 0], '0x0'],
      [[-0, 0], '0x0'],
      [[-1, -1], '-1x-1'],
      [[1, 0], '1x0'],
    ] as [
      Coordinates,
      string,
    ][]
  ) {
    await t.step(
      `it should convert point ${point1} to the string ${stringRepresentation}`,
      () => {
        assertEquals(pointToString(point1), stringRepresentation)
      },
    )
  }
})
