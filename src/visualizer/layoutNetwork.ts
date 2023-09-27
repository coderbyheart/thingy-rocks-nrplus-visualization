import { Coordinates, Network, surveysToNetwork } from './surveysToNetwork.ts'
import { survey } from '../mesh/example.ts'

const pointDistance = ([x1, y1]: Coordinates, [x2, y2]: Coordinates): number =>
  Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))

const pointAngle = ([x1, y1]: Coordinates, [x2, y2]: Coordinates): number =>
  Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI

const degToRag = (degrees: number): number => degrees * (Math.PI / 180)

const compareLayouts = (
  layout1: Record<string, Coordinates>,
  layout2: Record<string, Coordinates>,
  gravity = 0.0001,
): boolean =>
  Object.entries(layout1).reduce(
    (allEqual, [id, pos]) =>
      allEqual
        ? Math.abs(layout2[id][0] - pos[0]) < gravity && Math.abs(layout2[id][1] - pos[1]) < gravity
        : false,
    true,
  )

const clone = (nodes: Record<string, Coordinates>): Record<string, Coordinates> =>
  Object.entries(nodes).reduce(
    (newNetwork, [id, coordinates]) => ({ ...newNetwork, [id]: [...coordinates] }),
    {},
  )

const layout = (
  network: Network,
  onPosition: (id: number, position: Coordinates) => unknown,
  options?: { maxIterations?: number; maxDistance?: number },
): Network => {
  const maxIterations = options?.maxIterations ?? 100
  const maxDistance = options?.maxDistance ?? 100
  const maxMove = maxDistance * 0.1
  let layout = clone(network.nodes)
  for (let i = 0; i < maxIterations; i++) {
    for (const edge of network.edges) {
      // Update the position of the nodes based on the weight
      // Move edges at most 10% of max distance apart until they have reached their target distance
      const sourcePos = network.nodes[edge.source]
      const targetPos = network.nodes[edge.target]
      const weightedDistance = maxDistance * edge.weight
      const distance = pointDistance(sourcePos, targetPos)
      const delta = weightedDistance - distance
      // The direction to the targe, move the source into the opposite direction later
      const direction = distance === 0 ? Math.random() * 360 : pointAngle(sourcePos, targetPos)
      const moveAmount = Math.min(delta, maxMove)

      // Move myself away from the target
      network.nodes[edge.source][0] += Math.cos(degToRag(-direction)) * moveAmount
      network.nodes[edge.source][1] += Math.sin(degToRag(-direction)) * moveAmount
      onPosition(edge.source, network.nodes[edge.source])
    }
    if (compareLayouts(layout, network.nodes)) break // No change in layout
    layout = clone(network.nodes)
  }
  return {
    nodes: network.nodes,
    edges: network.edges,
  }
}

console.log(
  layout(surveysToNetwork(survey), (id, [x, y]) => console.log(`${id} moved to [${x},${y}]`)),
)
