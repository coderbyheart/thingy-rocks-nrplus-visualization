import { Layout } from './layouter.ts'

export const clone = (nodes: Layout): Layout =>
  Object.entries(nodes).reduce(
    (newNetwork, [id, coordinates]) => ({ ...newNetwork, [id]: [...coordinates] }),
    {},
  )
