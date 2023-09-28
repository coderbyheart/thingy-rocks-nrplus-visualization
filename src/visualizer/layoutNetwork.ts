import { NetworkId } from '../mesh/types.ts'
import { Layout, Layouter, Node, OnPositionsListener } from './layouter.ts'
import { degToRad } from './degToRad.ts'
import { pointAngle } from './pointAngle.ts'
import { pointDistance } from './pointDistance.ts'
import { clone } from './clone.ts'
import { compareLayouts } from './compareLayouts.ts'

/**
 * Converts a signal strength in dBm to a weight value between 0 and 1.
 *
 * @param dBm - The signal strength in dBm.
 * @returns A number between 0 and 1 representing the weight value.
 *
 * @example
 * const weight = dBmToWeight(-80);
 * console.log(weight); // Output: 0.5714285714285714
 */
const dBmToWeight = (dBm: number): number => Math.max(Math.min(dBm / -140, 1), 0)

export const layouter = (
  options?: { maxIterations?: number; maxDistance?: number; maxMove?: number },
): Layouter => {
  const maxIterations = options?.maxIterations ?? 100
  const maxDistance = options?.maxDistance ?? 100
  const maxMove = options?.maxMove ?? maxDistance * 0.1

  const onPositionListeners: OnPositionsListener[] = []
  const nodes: Record<NetworkId, Node> = {}
  let layout: Layout = {}
  let running = true

  let iteration = 0
  const l: Layouter = {
    onPositions: (listener) => {
      onPositionListeners.push(listener)
      return l
    },
    addNode: (node) => {
      nodes[node.id] = node
      // Restart animation in case it was stopped
      running = true
      iteration = 0
      return l
    },
    next: () => {
      if (++iteration > maxIterations) {
        running = false
      }
      if (!running) {
        return running
      }

      const newLayout = clone(layout)

      const moveNode = (nodeId: number, distance: number, direction: number) => {
        const sourcePos = newLayout[nodeId] ?? [0, 0]
        const deltaX = Math.cos(degToRad(360 - direction) % 360) * distance
        const deltaY = Math.sin(degToRad(360 - direction) % 360) * distance
        const newX = sourcePos[0] + deltaX
        const newY = sourcePos[1] + deltaY

        newLayout[nodeId] = [newX, newY]
      }

      const distanceNodes = (nodeIdA: number, nodeIdB: number, weight: number) => {
        // Update the position of the nodes based on the weight
        // Move edges at most 10% of max distance apart until they have reached their target distance
        const sourcePos = newLayout[nodeIdA] ?? [0, 0]
        const targetPos = newLayout[nodeIdB] ?? [0, 0]
        const weightedDistance = maxDistance * weight
        const distance = pointDistance(sourcePos, targetPos)
        const delta = weightedDistance - distance
        // The direction to the targe, move the source into the opposite direction later
        const direction = distance === 0 ? Math.random() * 360 : pointAngle(sourcePos, targetPos)

        const moveAmount = Math.min(delta, maxMove)

        // Move myself away from the target
        moveNode(nodeIdA, moveAmount, direction)
      }

      for (const node of Object.values(nodes)) {
        // Place node
        if (newLayout[node.id] === undefined) newLayout[node.id] = [0, 0]
        // Move myself away from my peers, based on the weight
        for (const [peerId, { signalStrengthDBm }] of Object.entries(node.peers)) {
          distanceNodes(node.id, parseInt(peerId, 16), dBmToWeight(signalStrengthDBm))
        }

        // Move myself away from all other nodes
        for (
          const notPeerId of Object.keys(nodes).filter((id) =>
            parseInt(id, 16) !== node.id &&
            !Object.keys(node.peers).includes(id)
          )
        ) {
          distanceNodes(node.id, parseInt(notPeerId, 16), 1)
        }

        // Move away from all nodes that are nearby
        const { direction, distance } = Object.keys(nodes)
          // should not include myself
          .filter((id) => parseInt(id, 16) !== node.id)
          // should not be a peer
          .filter((id) => !Object.keys(node.peers).includes(id))
          // should be close by
          .filter((id) =>
            pointDistance(newLayout[node.id] ?? [0, 0], newLayout[id] ?? [0, 0]) < maxDistance
          ).map((id) => {
            const sourcePos = newLayout[node.id] ?? [0, 0]
            const targetPos = newLayout[id] ?? [0, 0]
            return ({
              distance: pointDistance(sourcePos, targetPos),
              direction: pointAngle(sourcePos, targetPos),
            })
          }).reduce((move, peer, i, arr) => {
            console.log(peer)
            const m = {
              direction: move.direction + ((360 - peer.direction) % 360),
              distance: move.distance + peer.distance,
            }
            if (i === arr.length - 1) {
              return {
                direction: m.direction / arr.length,
                distance: Math.min(m.distance / arr.length, maxMove),
              }
            }
            return m
          }, { direction: 0, distance: 0 })
        moveNode(node.id, distance, direction)
      }

      if (compareLayouts(layout, newLayout)) {
        // No change in layout
        running = false
        return running
      }

      layout = newLayout

      onPositionListeners.map((fn) => fn(layout))
      return running
    },
    stop: () => {
      running = false
    },
  }

  return l
}
