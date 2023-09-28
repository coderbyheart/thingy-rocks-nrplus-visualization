import { NetworkId } from '../mesh/types.ts'
import { Peers } from '../mesh/types.ts'
import { clone } from './clone.ts'
import { compareLayouts } from './compareLayouts.ts'

export type Layout = Record<string, Coordinates>

export type Coordinates = [number, number]
export type Node = {
  id: number
  routeCost: number
  peers: Peers
}

export type Vector = {
  direction: number
  length: number
}

export type OnPositionsListener = (positions: Layout) => unknown
export type OnVectorsListener = (
  vectors: Record<string, {
    components: {
      cause: number
      vector: Vector
    }[]
    result: Vector
  }>,
) => unknown
export type Layouter = {
  onPositions: (listener: OnPositionsListener) => Layouter
  onVectors: (listener: OnVectorsListener) => Layouter
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

export const layouter = (): Layouter => {
  const onPositionListeners: OnPositionsListener[] = []
  const onVectorsListeners: OnVectorsListener[] = []
  const nodes: Record<NetworkId, Node> = {}
  let running = true

  let layout: Layout = {}

  const l: Layouter = {
    onPositions: (listener) => {
      onPositionListeners.push(listener)
      return l
    },
    onVectors: (listener) => {
      onVectorsListeners.push(listener)
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

      for (const node of Object.values(nodes)) {
        // Place node
        if (newLayout[node.id] === undefined) newLayout[node.id] = [0, 0]
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
