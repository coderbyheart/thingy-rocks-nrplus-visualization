import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { radToDeg } from './radToDeg.ts'

Deno.test('radToDeg()', async (t) => {
  for (
    const [rad, deg] of [
      [0, 0],
      [Math.PI, 180],
      [Math.PI * 2, 0],
      // don't do more than a full circle
      [Math.PI * 2.5, 90],
      // Do the shortest turn
      [Math.PI * 3.5, -90],
    ] as [
      number,
      number,
    ][]
  ) {
    await t.step(
      `it should convert ${rad} radians to ${deg} degrees`,
      () => {
        assertEquals(radToDeg(rad), deg)
      },
    )
  }
})
