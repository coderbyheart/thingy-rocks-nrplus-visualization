import { NetworkId } from '../mesh/types.ts'
import { Peers } from '../mesh/types.ts'
import { clone } from './clone.ts'
import { compareLayouts } from './compareLayouts.ts'
import { pointDistance } from './pointDistance.ts'
import { pointEquals } from './pointEquals.ts'
import { pointToString } from './pointToString.ts'
import { vectorSum } from './vectorSum.ts'

export type NodePositions = Record<string, Coordinates>

export type Coordinates = [number, number]
export type Node = {
  id: number
  routeCost: number
  peers: Peers
}

export type Vector = {
  direction: number
  magnitude: number
}

export type NodeVectors = {
  cause: number
  vector: Vector
}[]

type NodeVectorsMap = Record<string, NodeVectors>

export type OnPositionsListener = (positions: NodePositions) => unknown
type NodeMoves = Record<string, {
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
  const nodes: Record<NetworkId, Node> = {}
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
      // Restart animation in case it was stopped
      running = true
      return l
    },
    next: () => {
      if (!running) {
        return running
      }

      const newLayout = clone(layout)

      const getNextDirection = samePointDirections(layout, nodes)
      const nodeVectors: NodeVectorsMap = {}

      for (const node of Object.values(nodes)) {
        // Place node
        const nodePos = newLayout[node.id] ?? [0, 0]
        if (newLayout[node.id] === undefined) newLayout[node.id] = nodePos
        const vectors: NodeVectors = nodeVectors[node.id] ?? []
        nodeVectors[node.id] = vectors
        // Move away from all other nodes
        for (
          const neighbour of Object.keys(nodes).filter((id) => parseInt(id, 10) !== node.id).map(
            (id) => {
              const position = newLayout[id] ?? [0, 0]
              const distance = pointDistance(position, nodePos)
              return ({ id: parseInt(id, 10), position, distance })
            },
          ).filter((node) => node.distance < force)
        ) {
          if (pointEquals(nodePos, neighbour.position)) {
            // There are nodes on the same point, so there is no "direction" between them.
            // -> move them away using circle segments
            const direction = getNextDirection(nodePos)
            vectors.push({
              cause: neighbour.id,
              vector: {
                direction,
                magnitude: Math.max(
                  0,
                  Math.min(
                    // Nodes should have force distance
                    force -
                      // ... halve the distance, because nodes will push each other
                      (neighbour.distance / 2),
                  ),
                ),
              },
            })
          }
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
    return currentSegment
  }
}
