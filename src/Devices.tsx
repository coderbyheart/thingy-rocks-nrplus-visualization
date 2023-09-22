// @deno-types="npm:solid-js/store"
import { createStore } from 'solid-js/store'

export const Devices = () => {
  const [message, updateMessage] = createStore<{
    receiver: string
  }>({
    receiver: '',
  })

  const validNodeId = (id: string) => /^[0-9a-z]{1,}$/i.test(id)

  const isValid = () => validNodeId(message.receiver)

  return (
    <div class='container my-4'>
      <div class='row py-4'>
        <main class='col-12 col-md-8'></main>
        <aside class='col-12 col-md-4'>
          <form class='card'>
            <div class='card-header'>
              <h1 class='fs-4 my-0'>Add message</h1>
            </div>
            <div class='card-body'>
              <div class='mb-3'>
                <label for='receivingNodeId' class='form-label'>Receiving Node ID</label>
                <input
                  type='text'
                  class='form-control'
                  id='receivingNodeId'
                  placeholder={`e.g. "${randomNodeId()}"`}
                  onInput={(e) => updateMessage('receiver', e.target.value)}
                />
              </div>
            </div>
            <div class='card-footer'>
              <button class='btn btn-primary' type='button' disabled={!isValid()}>add</button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}

const randomNodeId = () => crypto.randomUUID().split('-').pop()?.slice(0, 8) ?? ''
