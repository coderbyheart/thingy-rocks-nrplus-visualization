import { NetworkId } from '../mesh/types.ts'
import { clone } from './clone.ts'
import { compareLayouts } from './compareLayouts.ts'
import { getPos } from './getPos.ts'
import { pointDirection } from './pointDirection.ts'
import { pointDistance } from './pointDistance.ts'
import { pointEquals } from './pointEquals.ts'
import { pointToString } from './pointToString.ts'
import { vectorSum } from './vectorSum.ts'

export type NodePositions = Record<string, Coordinates>
export type Coordinates = [number, number]
/**
 * A float between 0 and 1
 */
export type Attraction = number
export type NodeID = string
export type Node = {
  id: NodeID
  peers: Record<NodeID, Attraction>
}

export type Vector = {
  direction: number
  magnitude: number
}

export type NodeVectors = {
  cause: NodeID
  vector: Vector
}[]

type NodeVectorsMap = Record<string, NodeVectors>

export type OnPositionsListener = (positions: NodePositions) => unknown
export type NodeMoves = Record<string, {
  components: NodeVectors
  result: Vector
}>
export type OnMoveListener = (
  moves: NodeMoves,
) => unknown
export type Layouter = {
  onPositions: (listener: OnPositionsListener) => Layouter
  onMoves: (listener: OnMoveListener) => Layouter
  addNode: (node: Node) => Layouter
  /**
   * This calculates the next layout state
   *
   * @returns false if the animation is finished
   */
  next: () => boolean
  /**
   * Stop the animation
   */
  stop: () => void
}

export const layouter = (options?: {
  /**
   * The force that pushes nodes apart
   *
   * @default 100
   */
  force?: number
  /**
   * The maximum amount nodes are allowed to move per iteration
   *
   * @default 10
   */
  maxMove?: number
}): Layouter => {
  const onPositionListeners: OnPositionsListener[] = []
  const onMovesListeners: OnMoveListener[] = []
  const nodes: Record<NodeID, Node> = {}
  const force = options?.force ?? 100
  const maxMove = options?.maxMove ?? 10
  let running = true

  let layout: NodePositions = {}

  const l: Layouter = {
    onPositions: (listener) => {
      onPositionListeners.push(listener)
      return l
    },
    onMoves: (listener) => {
      onMovesListeners.push(listener)
      return l
    },
    addNode: (node) => {
      nodes[node.id] = node
      // Place all peers
      for (const [peer, attraction] of Object.entries(node.peers)) {
        if (nodes[peer] === undefined) {
          nodes[peer] = {
            id: peer,
            peers: {
              [node.id]: attraction,
            },
          }
        }
      }
      // Restart animation in case it was stopped
      running = true
      return l
    },
    next: () => {
      if (!running) {
        return running
      }

      const newLayout = clone(layout)
      const nodeVectors: NodeVectorsMap = {}
      const getNodeDirection = nodeDirection(newLayout, nodes)

      for (const node of Object.values(nodes)) {
        // Place node
        const nodePos = newLayout[node.id] ?? [0, 0]
        if (newLayout[node.id] === undefined) newLayout[node.id] = nodePos
        const vectors: NodeVectors = nodeVectors[node.id] ?? []
        nodeVectors[node.id] = vectors

        // Move away from all nodes that are not peers and close by
        for (
          const neighbour of Object.keys(nodes)
            // Filter out myself
            .filter((id) => id !== node.id)
            // Filter out peers
            .filter((id) => node.peers[id] === undefined)
            // Calculate the distance to these nodes
            .map(
              (id) => {
                const position = newLayout[id] ?? [0, 0]
                const distance = pointDistance(position, nodePos)
                return ({ id: id, position, distance })
              },
            )
            // and remove those that are too far away
            .filter((node) => node.distance < force)
        ) {
          vectors.push({
            cause: neighbour.id,
            vector: {
              direction: getNodeDirection(node, neighbour),
              magnitude: Math.max(
                0,
                Math.min(
                  force -
                    // ... halve the distance, because nodes will push each other
                    (neighbour.distance / 2),
                ),
              ),
            },
          })
        }

        // Move towards peers
        // FIXME: push apart if too close together, e.g. in iteration 0
        for (const [peerId, attraction] of Object.entries(node.peers)) {
          const peerPosition = newLayout[peerId] ?? [0, 0]
          const distance = pointDistance(nodePos, peerPosition)
          vectors.push({
            cause: peerId,
            vector: {
              direction: (getNodeDirection(node, { id: peerId }) -
                    // Move towards the node
                    Math.PI) % Math.PI * 2,
              magnitude:
                // Close the gap
                Math.max(
                  distance,
                  // Min distance should be based on attraction
                  // the higher the attraction the closer the distance
                  (force - force * attraction) /
                    // ... halve the attraction, because nodes will attract each other
                    2,
                ),
            },
          })
        }
      }

      const moves: NodeMoves = {}
      for (const [id, vectors] of Object.entries(nodeVectors)) {
        const result = vectorSum(vectors.map(({ vector }) => vector))
        moves[id] = {
          components: vectors,
          result: {
            direction: result.direction,
            magnitude: Math.min(result.magnitude, maxMove), // Limit movement to max allowed movement
          },
        }
      }

      onMovesListeners.map((listener) => listener(moves))

      // Move the nodes
      for (const [id, { result }] of Object.entries(moves)) {
        const nodePos = newLayout[id] ?? [0, 0]
        const posDelta = getPos(result)
        newLayout[id] = [nodePos[0] + posDelta[0], nodePos[1] + posDelta[1]]
      }

      if (compareLayouts(layout, newLayout)) {
        // No change in layout
        running = false
        return running
      }

      layout = newLayout

      onPositionListeners.map((fn) => fn(newLayout))
      return running
    },
    stop: () => {
      running = false
    },
  }

  return l
}

const numberOfNodesOnPoint = (
  layout: NodePositions,
  nodes: Record<NetworkId, Node>,
  point: Coordinates,
): number =>
  Object.keys(nodes).map((id) => layout[id] ?? [0, 0]).filter((pos) => pointEquals(point, pos))
    .length

const samePointDirections = (layout: NodePositions, nodes: Record<NetworkId, Node>) => {
  const samePointDirection: Record<string, {
    segment: number
    currentSegment: number
  }> = {}
  return (position: Coordinates): number => {
    const pointDetails = samePointDirection[pointToString(position)] ?? {
      segment: Math.PI * 2 / numberOfNodesOnPoint(layout, nodes, position),
      currentSegment: 0,
    }
    samePointDirection[pointToString(position)] = pointDetails
    const currentSegment = pointDetails.currentSegment
    pointDetails.currentSegment = (currentSegment + pointDetails.segment) % (Math.PI * 2)
    return currentSegment > Math.PI ? -(Math.PI * 2 - currentSegment) : currentSegment
  }
}

const nodeDirection = (layout: NodePositions, nodes: Record<NetworkId, Node>) => {
  const nodeDirections: Record<string, number> = {}
  const getNextDirection = samePointDirections(layout, nodes)

  return (nodeA: { id: string }, nodeB: { id: string }): number => {
    const key = `${nodeA.id}->${nodeB.id}`
    if (nodeDirections[key] === undefined) {
      const nodeAPos = layout[nodeA.id] ?? [0, 0]
      const nodeBPos = layout[nodeB.id] ?? [0, 0]
      nodeDirections[key] =
        // There are nodes on the same point, so there is no "direction" between them.
        pointEquals(nodeAPos, nodeBPos)
          // -> move them away using circle segments
          ? getNextDirection(nodeAPos)
          // -> use direction between them
          : pointDirection(nodeBPos, nodeAPos)
    }
    return nodeDirections[key]
  }
}
