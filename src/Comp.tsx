// @deno-types="npm:solid-js"
import { createSignal } from 'solid-js'

export default () => {
  const [value, setValue] = createSignal(0)
  setInterval(() => {
    setValue(value() + 1)
  }, 1000)

  return <h1>Hello world! {value()}</h1>
}
