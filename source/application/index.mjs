// oncontrollerchange: é disparado quando o service worker que controla a página muda, por exemplo, quando um novo service worker é instalado e ativado.
// onerror: é disparado quando ocorre um erro no service worker ou em uma das suas promessas.
// onmessage: é disparado quando o service worker envia uma mensagem para a página usando a interface ServiceWorker.postMessage() ou a interface MessageChannel.
// onmessageerror: é disparado quando ocorre um erro ao receber uma mensagem do service worker
// const broadcast = new BroadcastChannel('notifications')
// broadcast.addEventListener('message', event => {
//     alert(JSON.stringify(event.data))
// })

import { Cryptography } from "./utils/Cryptography.mjs"
import { ServiceWorker } from "./utils/ServiceWorker.mjs"

const url = new URL(`${location.origin}/source/application/worker/ServiceWorker.js`)
ServiceWorker.register(url)

for (let i = 0; i < 50; i++) {
console.log(Cryptography.uuid())
}