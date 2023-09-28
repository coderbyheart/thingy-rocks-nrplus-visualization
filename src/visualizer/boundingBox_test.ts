import { boundingBox } from './boundingBox.ts'
import { assertObjectMatch } from 'https://deno.land/std@0.202.0/assert/mod.ts'

Deno.test('boundingBox()', async (t) => {
  await t.step('it should calculate the bounding box', () => {
    const bb = boundingBox([
      [0.2089877376882115, 37.2853497942138],
      [0.1561486923450972, -57.00034929966087],
      [0.08745611143606598, 27.99962294344831],
    ])

    assertObjectMatch(bb, {
      width: 0.2089877376882115 - 0.08745611143606598,
      height: 37.2853497942138 - -57.00034929966087,
    })
  })
})
