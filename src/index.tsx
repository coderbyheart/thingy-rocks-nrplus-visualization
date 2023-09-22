/* @refresh reload */
// @deno-types="npm:solid-js/web"
import { render } from 'solid-js/web'

import App from './App.tsx'
import './base.css'

const root = document.getElementById('root')

render(() => <App />, root!)
