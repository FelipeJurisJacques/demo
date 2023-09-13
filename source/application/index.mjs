// oncontrollerchange: é disparado quando o service worker que controla a página muda, por exemplo, quando um novo service worker é instalado e ativado.
// onerror: é disparado quando ocorre um erro no service worker ou em uma das suas promessas.
// onmessage: é disparado quando o service worker envia uma mensagem para a página usando a interface ServiceWorker.postMessage() ou a interface MessageChannel.
// onmessageerror: é disparado quando ocorre um erro ao receber uma mensagem do service worker
// const broadcast = new BroadcastChannel('notifications')
// broadcast.addEventListener('message', event => {
//     alert(JSON.stringify(event.data))
// })

import { DataBase } from "./utils/DataBase.mjs"
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

const db = new DataBase()
db.storage('tabela_teste').then(transaction => {
    const storage = transaction.storage('tabela_teste')
    storage.add({
        title: 'test 1'
    }).then(response => {
        console.log(response)
    }).catch(error => {
        console.error(error)
    })
    storage.add({
        title: 'test 2'
    }).then(response => {
        console.log(response)
    }).catch(error => {
        console.error(error)
    })
}).catch(error => {
    console.error(error)
})
db.storage('tabela_teste').then(transaction => {
    console.log(transaction)
    const storage = transaction.storage('tabela_teste')
    storage.add({
        title: 'test 3'
    }).then(response => {
        console.log(response)
    }).catch(error => {
        console.error(error)
    })
    storage.add({
        title: 'test 4'
    }).then(response => {
        console.log(response)
    }).catch(error => {
        console.error(error)
    })
}).catch(error => {
    console.error(error)
})