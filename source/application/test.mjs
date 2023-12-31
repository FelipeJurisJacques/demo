// oncontrollerchange: é disparado quando o service worker que controla a página muda, por exemplo, quando um novo service worker é instalado e ativado.
// onerror: é disparado quando ocorre um erro no service worker ou em uma das suas promessas.
// onmessage: é disparado quando o service worker envia uma mensagem para a página usando a interface ServiceWorker.postMessage() ou a interface MessageChannel.
// onmessageerror: é disparado quando ocorre um erro ao receber uma mensagem do service worker
// const broadcast = new BroadcastChannel('notifications')
// broadcast.addEventListener('message', event => {
//     alert(JSON.stringify(event.data))
// })

import { Integrity } from "./models/Integrity.mjs";

Integrity.base().then(async data => {
    data.teste = 5
    data.teste_1 = 'testando'
    // data.teste_2 = 3
    // data.teste_2 = 4
    // data.teste_2 = [{
    //     teste: 'onjeto dentro de outro'
    // }, 2, 3,]
    // data.teste_2 = [1,2]
    delete data.teste_2
    console.log(data)
    console.log(await data.teste_2)
}).catch(event => {
    console.error(event)
})

// import { Recursive } from "./models/Recursive.mjs";

// import { ServiceWorker } from "./utils/ServiceWorker.mjs"

// const url = new URL(`${location.origin}/source/application/worker/ServiceWorker.js`)
// ServiceWorker.register(url)
// console.log('testando...')
// ServiceWorker.message.request('teste').then(response => {
//     console.log(response)
// })
// ServiceWorker.message.request('teste 2').then(response => {
//     console.log(response)
// })
// Recursive.base().then(async data => {
//     data.variavel_1 = 'teste'
//     data.variavel_2 = 2
//     console.log(data)
// }).catch(event => {
//     console.error(event)
// })