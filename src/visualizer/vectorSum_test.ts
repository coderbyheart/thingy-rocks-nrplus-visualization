import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { vectorSum } from './vectorSum.ts'
import { Vector } from './layouter.ts'

Deno.test('vectorSum()', async (t) => {
  for (
    const [vectors, expectedVector] of [
      [[], { direction: 0, magnitude: 0 }],
      [[{ direction: 0, magnitude: 100 }], { direction: 0, magnitude: 100 }],
      // 45 degrees
      [[{ direction: 0, magnitude: 100 }, { direction: Math.PI / 2, magnitude: 100 }], {
        direction: Math.PI / 4,
        magnitude: Math.sqrt(Math.pow(100, 2) + Math.pow(100, 2)),
      }],
    ] as [
      Vector[],
      Vector,
    ][]
  ) {
    await t.step(
      `it should calculate resulting vector of ${JSON.stringify(vectors)} to be ${
        JSON.stringify(expectedVector)
      }`,
      () => assertEquals(vectorSum(vectors), expectedVector),
    )
  }

  await t.step(
    `two vectors can cancel each other out`,
    () =>
      assertEquals(
        Math.round(
          vectorSum([{ direction: 0, magnitude: 100 }, { direction: Math.PI, magnitude: 100 }])
            .magnitude,
        ),
        0,
      ),
  )
})
