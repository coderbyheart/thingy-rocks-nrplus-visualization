// Example network survey from three nodes

import { NetworkSurvey } from './types.ts'

export const surveys: NetworkSurvey[] = [
  // This sink
  {
    networkId: 1,
    channel: 1,
    frequencyMHz: 1890,
    hardwareId: '28d463fd-2dda-4257-8be2-4b65e595c29b',
    routeCost: 0,
    ts: 1695741718899,
    peers: {
      2: {
        routeCost: 1,
        signalStrengthDBm: -132,
      },
    },
  },
  // Relay
  {
    networkId: 2,
    channel: 1,
    frequencyMHz: 1890,
    hardwareId: '88edf53a-9b61-4e0c-af94-b2f45d317ff7',
    routeCost: 1,
    ts: 1695741806278,
    peers: {
      1: {
        routeCost: 0,
        signalStrengthDBm: -132,
      },
      3: {
        routeCost: 2,
        signalStrengthDBm: -119,
      },
    },
  },
  // Leaf
  {
    networkId: 3,
    channel: 1,
    frequencyMHz: 1890,
    hardwareId: '27869450-0aa1-4c43-b4f3-a4d95fcbffe4',
    routeCost: 2,
    ts: 1695741811633,
    peers: {
      2: {
        routeCost: 1,
        signalStrengthDBm: -119,
      },
    },
  },
]

void surveys
