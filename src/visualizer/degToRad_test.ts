import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { degToRad } from './degToRad.ts'

Deno.test('degToRad()', async (t) => {
  for (
    const [deg, rad] of [
      [0, 0],
      [180, Math.PI],
      // don't do more than a full circle
      [360, 0],
      [450, Math.PI / 2],
      // Do the shortest turn
      [270, -(Math.PI / 2)],
    ] as [
      number,
      number,
    ][]
  ) {
    await t.step(
      `it should convert ${deg} degrees to ${rad} radians`,
      () => {
        assertEquals(degToRad(deg), rad)
      },
    )
  }
})
