// @deno-types="npm:solid-js"
import { type Component, createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
// @deno-types="npm:@solid-primitives/resize-observer"
import { createResizeObserver } from '@solid-primitives/resize-observer'
import { surveys } from './mesh/example.ts'
import { NetworkId, NetworkSurvey } from './mesh/types.ts'
import { Coordinates, layouter } from './visualizer/layouter.ts'
import { BoundingBox, boundingBox } from './visualizer/boundingBox.ts'

enum Colors {
  highlight = '#00FF00',
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
    <div ref={ref} style={{ height: '100%', 'max-height': '100vh' }}>
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
  const [positions, setPositions] = createSignal<Record<NetworkId, Coordinates>>({})
  const [bb, setBB] = createSignal<BoundingBox>({ width: 0, height: 0 })

  const layout = layouter({ maxMove: 10 })
  layout.onPositions((positions) => {
    console.log(`[MeshVisualization] positions`, positions)
    setPositions(positions)
    setBB(boundingBox(Object.values(positions)))
  })
  layout.onMoves((moves) => console.log(`[MeshVisualization] moves`, moves))

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
      id: 1,
      routeCost: 0,
      peers: {},
    })
    layout.addNode({
      id: 2,
      routeCost: 0,
      peers: {},
    })
    layout.addNode({
      id: 3,
      routeCost: 0,
      peers: {},
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
      <circle
        fill={'none'}
        stroke={Colors.highlight}
        stroke-width={1}
        stroke-linecap={'round'}
        stroke-linejoin={'round'}
        cx={width / 2}
        cy={height / 2}
        r={1}
      />
      <For each={Object.entries(positions())}>
        {([nodeId, position]) => {
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
            </>
          )
        }}
      </For>
    </svg>
  )
}
