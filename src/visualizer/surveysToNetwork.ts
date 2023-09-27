import { NetworkSurvey } from '../mesh/types.ts'
type Edge = {
  source: number
  target: number
  weight: number
}
export type Coordinates = [number, number]
export type Network = {
  nodes: Record<string, Coordinates>
  edges: Edge[]
}
export const surveysToNetwork = (surveys: NetworkSurvey[]): Network => {
  const network: Network = {
    nodes: {},
    edges: [],
  }

  for (const survey of surveys.sort(byAgeDescending)) {
    if (network.nodes[survey.networkId] === undefined) {
      network.nodes[survey.networkId] = [0, 0]
      for (const [peerId, { signalStrengthDBm }] of Object.entries(survey.peers)) {
        const existingEdge = network.edges.find(({ source, target }) =>
          source === survey.networkId || target === survey.networkId
        )
        if (existingEdge !== undefined) continue
        network.edges.push({
          source: survey.networkId,
          target: parseInt(peerId),
          weight: dBmToWeight(signalStrengthDBm),
        })
      }
    }
  }

  return network
}

const byAgeDescending = (a: NetworkSurvey, b: NetworkSurvey) => b.ts - a.ts

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
