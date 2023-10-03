import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { layouter, OnMoveListener } from './layouter.ts'
import { assertSpyCall, assertSpyCalls, spy } from 'https://deno.land/std@0.202.0/testing/mock.ts'

Deno.test('layouter()', async (t) => {
  await t.step(
    `it should position a new node on 0,0`,
    () => {
      const onPositions = spy()
      const layout = layouter().onPositions(onPositions)
      layout.addNode({
        id: 1,
        peers: [],
        routeCost: 0,
      })
      assertEquals(layout.next(), true)
      assertSpyCall(onPositions, 0, {
        args: [{
          '1': [0, 0],
        }],
      })
      // it should finish without additional nodes
      assertEquals(layout.next(), false)
      assertSpyCalls(onPositions, 1)
    },
  )

  await t.step(
    `it should move two nodes apart`,
    () => {
      const onVectors = spy()
      const layout = layouter().onMoves(onVectors)
      layout.addNode({
        id: 1,
        peers: [],
        routeCost: 0,
      })
      layout.addNode({
        id: 2,
        peers: [],
        routeCost: 0,
      })
      assertEquals(layout.next(), true)
      // It should create vectors moving the two nodes apart
      const expectedVectors: Parameters<OnMoveListener>[0] = {
        '1': {
          components: [{
            cause: 2,
            vector: {
              direction: 0,
              magnitude: 100, // maxDistance
            },
          }],
          result: {
            direction: 0,
            magnitude: 10, // maxMove
          },
        },
        '2': {
          components: [{
            cause: 1,
            vector: {
              direction: Math.PI,
              magnitude: 100, // maxDistance
            },
          }],
          result: {
            direction: Math.PI,
            magnitude: 10, // maxMove
          },
        },
      }
      assertSpyCall(onVectors, 0, {
        args: [expectedVectors],
      })
    },
  )
})
