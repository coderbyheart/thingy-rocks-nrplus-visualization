import type { Component } from 'npm:solid-js'
import { Devices } from './Devices.tsx'
import { NetworkDiagram } from './NetworkDiagram.tsx'

const App: Component = () => {
  return (
    <div class='container my-4'>
      <div class='row py-4'>
        <main class='col-12 col-md-8'>
          <NetworkDiagram />
        </main>
        <aside class='col-12 col-md-4'>
          <Devices />
        </aside>
      </div>
    </div>
  )
}

export default App
