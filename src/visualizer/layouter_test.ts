import { assertEquals } from 'https://deno.land/std@0.202.0/assert/assert_equals.ts'
import { layouter, NodeMoves, NodePositions, OnMoveListener } from './layouter.ts'
import { assertSpyCall, assertSpyCalls, spy } from 'https://deno.land/std@0.202.0/testing/mock.ts'
import { assertAlmostEquals } from 'https://deno.land/std@0.202.0/assert/mod.ts'
import { pointDistance } from './pointDistance.ts'

const Circle = Math.PI * 2

Deno.test('layouter()', async (t) => {
  await t.step(`Placing unconnected nodes`, async (t) => {
    await t.step(
      `it should position a new node on 0,0`,
      () => {
        const onPositions = spy()
        const layout = layouter().onPositions(onPositions)
        layout.addNode({
          id: '1',
          peers: {},
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
        const onMoves = spy()
        const layout = layouter().onMoves(onMoves)
        layout.addNode({
          id: '1',
          peers: {},
        })
        layout.addNode({
          id: '2',
          peers: {},
        })
        assertEquals(layout.next(), true)
        // It should create vectors moving the two nodes apart
        const expectedVectors: Parameters<OnMoveListener>[0] = {
          '1': {
            components: [{
              cause: '2',
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
              cause: '1',
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
        assertSpyCall(onMoves, 0, {
          args: [expectedVectors],
        })
      },
    )

    await t.step(
      `it should move three nodes apart`,
      () => {
        const onMoves = spy()
        const layout = layouter().onMoves(onMoves)
        layout.addNode({
          id: '1',
          peers: {},
        })
        layout.addNode({
          id: '2',
          peers: {},
        })
        layout.addNode({
          id: '3',
          peers: {},
        })
        assertEquals(layout.next(), true)
        // It should create vectors moving the two nodes apart
        const expectedVectors: Parameters<OnMoveListener>[0] = {
          '1': {
            components: [{
              cause: '2',
              vector: {
                direction: 0,
                magnitude: 100, // maxDistance
              },
            }, {
              cause: '3',
              vector: {
                direction: Circle / 3,
                magnitude: 100,
              },
            }],
            result: {
              direction: Circle / 6,
              magnitude: 10, // maxMove
            },
          },
          '2': {
            components: [{
              cause: '1',
              vector: {
                direction: -(1 / 3 * Circle),
                magnitude: 100, // maxDistance
              },
            }, {
              cause: '3',
              vector: {
                direction: 0,
                magnitude: 100,
              },
            }],
            result: {
              direction: -(1 / 6 * Circle),
              magnitude: 10, // maxMove
            },
          },
          '3': {
            components: [{
              cause: '1',
              vector: {
                direction: (1 / 3 * Circle),
                magnitude: 100, // maxDistance
              },
            }, {
              cause: '2',
              vector: {
                direction: -(1 / 3 * Circle),
                magnitude: 100,
              },
            }],
            result: {
              direction: Circle / 2,
              magnitude: 10, // maxMove
            },
          },
        }

        assertSpyCalls(onMoves, 1)
        const callArgs: Parameters<OnMoveListener>[0] = onMoves.calls[0].args[0]
        for (const nodeId of ['1', '2', '3']) {
          // Result
          assertAlmostEquals(
            expectedVectors[nodeId].result.direction,
            callArgs[nodeId].result.direction,
          )
          assertEquals(
            expectedVectors[nodeId].result.magnitude,
            callArgs[nodeId].result.magnitude,
          )
        }
      },
    )

    await t.step(`It should keep moving nodes apart until they are beyond the force`, () => {
      const onMoves = spy()
      const onPositions = spy()
      const layout = layouter({ force: 100, maxMove: 10 }).onMoves(onMoves).onPositions(
        onPositions,
      )
      layout.addNode({
        id: '1',
        peers: {},
      })
      layout.addNode({
        id: '2',
        peers: {},
      })
      layout.addNode({
        id: '3',
        peers: {},
      })
      let i = 0
      while (layout.next() && ++i < 10) {
        // pass
      }
      const positions: NodePositions = onPositions.calls.pop()?.args[0]
      const nodeDistance12 = pointDistance(positions[1], positions[2])
      const nodeDistance13 = pointDistance(positions[1], positions[3])
      const nodeDistance23 = pointDistance(positions[2], positions[3])
      assertAlmostEquals(nodeDistance12, 100, 10)
      assertAlmostEquals(nodeDistance13, 100, 10)
      assertAlmostEquals(nodeDistance23, 100, 10)
    })
  })

  await t.step(`Placing connected nodes`, async (t) => {
    await t.step(
      `It should move connected nodes together`,
      () => {
        const onMoves = spy()
        const onPositions = spy()
        const layout = layouter({ force: 100, maxMove: 10 }).onMoves(onMoves).onPositions(
          onPositions,
        )
        layout.addNode({
          id: '1',
          peers: {
            '2': 0.5,
          },
        })
        /*

        console.log(JSON.stringify(onMoves.calls.map(({ args }) => args[0]), null, 2))
        assertFalse(i === maxCalls, 'Animation should not have been aborted.')

        const positions: NodePositions = onPositions.calls.pop()?.args[0]
        const nodeDistance12 = pointDistance(positions[1], positions[2])
        assertAlmostEquals(nodeDistance12, 50, 10)
      */

        assertEquals(layout.next(), true)
        const moves: NodeMoves = onMoves.calls[0].args[0]
        // Move first node up by force
        assertEquals(moves['1'].components[0], {
          cause: '2',
          vector: {
            direction: -0,
            magnitude: 100 * // force
              0.5 / // attraction
              2, // halved, because nodes attract each other
          },
        })
        // Move second node down by force
        assertEquals(moves['2'].components[0], {
          cause: '1',
          vector: { direction: Math.PI, magnitude: 100 },
        })
      },
    )
  })
})
