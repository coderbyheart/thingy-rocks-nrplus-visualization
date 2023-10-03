import { NodePositions } from './layouter.ts'

export const clone = (nodes: NodePositions): NodePositions =>
  Object.entries(nodes).reduce(
    (newNetwork, [id, coordinates]) => ({ ...newNetwork, [id]: [...coordinates] }),
    {},
  )
