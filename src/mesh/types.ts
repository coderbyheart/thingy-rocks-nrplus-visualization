/**
 * Describes the network from a node's point of view.
 *
 * Nodes will broadcast this survey occasionally and it should be forwarded by all nodes so it reaches the sink.
 */
export type NetworkSurvey = {
  /**
   * Hardware ID of this node. This identifies the DK uniquely regardless of it's network.
   */
  hardwareId: string

  /**
   * ID of this node
   */
  networkId: NetworkId

  /**
   * Base-frequency of the spectrum used in MHz.
   *
   * DECT NR+ needs to be configured depending on the country it is deployed in.
   */
  frequencyMHz: number

  /**
   * Channel number currently used
   */
  channel: number

  /**
   * Route cost of a node is the lowest route cost from known peers plus 1.
   *
   * Sinks have a route cost of 0.
   */
  routeCost: RouteCost

  /**
   * Lists the other devices this device can see
   */
  peers: Peers

  /**
   * Unix-timestamp in seconds, when this survey was taken
   */
  ts: number
}

/**
 * Describes a node that is visible to the current node
 */
export type Peer = {
  signalStrengthDBm: SignalStrengthDBm
  // This is the route cost the node advertises
  routeCost: RouteCost
}

export type Peers = Record<NetworkId, Peer>

/**
 * Signal strength in dBm, for now we assume LTE range which is typically around -140 to -40 dBm
 *
 * @example -132
 */
export type SignalStrengthDBm = number

/**
 * 32-bit network ID of a node
 */
export type NetworkId = number

/**
 * >=0
 */
export type RouteCost = number
