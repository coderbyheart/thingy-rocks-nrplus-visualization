// @deno-types="npm:solid-js"
import {
  batch,
  type Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
// @deno-types="npm:@solid-primitives/resize-observer"
import { createResizeObserver } from '@solid-primitives/resize-observer'
import { surveys } from './mesh/example.ts'
import { NetworkId, NetworkSurvey } from './mesh/types.ts'
import { Coordinates, layouter, NodeMoves, NodePositions } from './visualizer/layouter.ts'
import { BoundingBox, boundingBox } from './visualizer/boundingBox.ts'
import { radToDeg } from './visualizer/radToDeg.ts'

enum Colors {
  highlight = '#00FF00',
  helpers = '#ff61dd88',
  forces = '#5f9efb',
}

export const NetworkDiagram = () => {
  const [size, setSize] = createSignal({ width: 0, height: 0 })

  let ref: HTMLDivElement | undefined
  onMount(() => {
    createResizeObserver(ref, ({ width, height }, el) => {
      if (el === ref) {
        setSize({ width, height })
      }
    })
  })

  return (
    <div
      ref={ref}
      style={{ height: '100%', 'max-height': '100vh', 'min-height': '50vh' }}
      onScroll={() => {
        console.log(`scroll`)
      }}
    >
      <Show when={size().width > 0}>
        <MeshVisualization size={size()} />
      </Show>
    </div>
  )
}

const MeshVisualization: Component<{ size: { width: number; height: number } }> = (
  props,
) => {
  const width = props.size.width
  const height = props.size.height
  const [positions, setPositions] = createSignal<NodePositions>({})
  const [moves, setMoves] = createSignal<NodeMoves>({})
  const [bb, setBB] = createSignal<BoundingBox>({ width: 0, height: 0 })

  const layout = layouter({ maxMove: 1 })
  layout.onPositions((positions, moves) => {
    batch(() => {
      setPositions(positions)
      setMoves(moves)
      setBB(boundingBox(Object.values(positions)))
    })
  })

  onMount(() => {
    let frame = requestAnimationFrame(loop)
    function loop() {
      frame = requestAnimationFrame(loop)
      if (!layout.next()) {
        cancelAnimationFrame(frame)
        console.log(`[MeshVisualization]`, `Animation stopped`)
      }
    }
    onCleanup(() => {
      cancelAnimationFrame(frame)
      layout.stop()
    })
  })

  // Load data
  /*
  createEffect(() => {
    const byAgeDescending = (a: NetworkSurvey, b: NetworkSurvey) => b.ts - a.ts
    for (const survey of surveys.sort(byAgeDescending)) {
      layout.addNode({
        id: survey.networkId,
        routeCost: survey.routeCost,
        peers: survey.peers,
      })
    }
  })
  */
  createEffect(() => {
    layout.addNode({
      id: '1',
      peers: {
        2: 0.125,
        3: 0.25,
        4: 0.375,
        5: 0.5,
        6: 0.625,
        7: 0.75,
        8: 0.875,
        9: 1,
      },
    })
    layout.addNode({
      id: '10',
      peers: {
        '11': 0.5,
      },
    })
    layout.addNode({
      id: '11',
      peers: {
        '12': 0.5,
      },
    })
    layout.addNode({
      id: '12',
      peers: {
        '13': 0.5,
      },
    })
    layout.addNode({
      id: '13',
      peers: {
        '14': 0.5,
      },
    })
    layout.addNode({
      id: '14',
      peers: {
        '15': 0.5,
      },
    })
    layout.addNode({
      id: '15',
      peers: {
        '16': 0.5,
      },
    }),
      layout.addNode({
        id: '21',
        peers: {
          22: 1,
          23: 0.5,
          24: 0.25,
        },
      })
  })

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Border */}
      <path
        d={`M 1,1 L ${width - 1},1 L ${width - 1},${height - 1} 1,${height - 1} L 1,1`}
        stroke-width={1}
        fill={'none'}
        stroke={Colors.helpers}
        stroke-dasharray='2 2'
      />
      {/* Center */}
      <path
        d={`M 1,${height / 2} L ${width - 1},${height / 2}`}
        stroke-width={1}
        fill={'none'}
        stroke={Colors.helpers}
        stroke-dasharray='2 2'
      />
      <path
        d={`M ${width / 2},1 L ${width / 2},${height - 1}`}
        stroke-width={1}
        fill={'none'}
        stroke={Colors.helpers}
        stroke-dasharray='2 2'
      />
      <For each={Object.entries(positions())}>
        {([nodeId, position]) => {
          const node = layout.node(nodeId)
          return (
            <>
              <circle
                fill={'none'}
                stroke={Colors.highlight}
                stroke-width={2}
                stroke-linecap={'round'}
                stroke-linejoin={'round'}
                stroke-miterlimit={2}
                cx={position[0] + (width / 2)}
                cy={position[1] + (height / 2)}
                r={10}
              />
              <text
                fill={Colors.highlight}
                font-size={'10'}
                x={position[0] + (width / 2)}
                y={position[1] + (height / 2) + 4}
                text-anchor='middle'
              >
                {nodeId}
              </text>
              <For each={Object.keys(node?.peers ?? {})}>
                {(peerId) => {
                  const peer = layout.node(peerId)
                  if (peer === undefined) return null
                  return (
                    <path
                      d={`M ${position[0] + (width / 2)},${position[1] + (height / 2)} L ${
                        peer.position[0] + (width / 2)
                      },${peer.position[1] + (height / 2)}`}
                      stroke-width={1}
                      stroke={Colors.highlight}
                      fill={'none'}
                    />
                  )
                }}
              </For>
            </>
          )
        }}
      </For>
      <For each={Object.entries(moves())}>
        {([nodeId, { components }]) => {
          const node = layout.node(nodeId)
          if (node === undefined) return null
          return (
            <For each={components}>
              {(component) => (
                <g
                  transform={`translate(${node.position[0] + (width / 2)},${
                    node.position[1] + (height / 2)
                  }),rotate(${radToDeg(component.vector.direction)})`}
                >
                  <path
                    d={`M 0,0 l ${component.vector.magnitude},0`}
                    stroke-width={1}
                    stroke={Colors.forces}
                    fill={'none'}
                  />
                  <text
                    fill={Colors.forces}
                    font-size={'10'}
                    x={component.vector.magnitude / 2}
                    y={0}
                    text-anchor='middle'
                  >
                    {`${component.cause} - ${Math.round(component.vector.magnitude)} → ${node.id}`}
                  </text>
                </g>
              )}
            </For>
          )
        }}
      </For>
    </svg>
  )
}
