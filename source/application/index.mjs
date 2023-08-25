// oncontrollerchange: é disparado quando o service worker que controla a página muda, por exemplo, quando um novo service worker é instalado e ativado.
// onerror: é disparado quando ocorre um erro no service worker ou em uma das suas promessas.
// onmessage: é disparado quando o service worker envia uma mensagem para a página usando a interface ServiceWorker.postMessage() ou a interface MessageChannel.
// onmessageerror: é disparado quando ocorre um erro ao receber uma mensagem do service worker

import { ServiceWorker } from "./utils/ServiceWorker.mjs"

ServiceWorker.postMessage('teste 2', {o:'myobj'})

const url = new URL(`${location.origin}/source/application/worker/ServiceWorker.js`)
ServiceWorker.register(url).then(sw => {
    console.log(sw)
})



const broadcast = new BroadcastChannel('notifications')
broadcast.addEventListener('message', event => {
    alert(JSON.stringify(event.data))
})
// window.addEventListener('message', event => {
//     alert(JSON.stringify(event.data))
// })