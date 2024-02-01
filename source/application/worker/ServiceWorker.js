importScripts(
    new URL(`${location.origin}/source/application/worker/IndexedDataBase.js`)
)

// install: é disparado quando o service worker é instalado pela primeira vez ou quando o arquivo do service worker é alterado. Esse evento é usado para armazenar em cache os recursos estáticos da aplicação, como HTML, CSS, JavaScript e imagens.
// activate: é disparado quando o service worker é ativado, ou seja, quando ele passa a controlar as páginas da aplicação. Esse evento é usado para limpar os caches antigos ou fazer outras tarefas de inicialização.
// fetch: é disparado quando o service worker intercepta uma solicitação de rede feita pela aplicação. Esse evento é usado para implementar estratégias de cache dinâmico, como cache first, network first, stale while revalidate, etc.
// push: é disparado quando o service worker recebe uma mensagem push do servidor. Esse evento é usado para mostrar uma notificação ao usuário ou atualizar os dados da aplicação em segundo plano.
// sync: é disparado quando o service worker recebe um sinal de sincronização periódica ou de uma tarefa em segundo plano. Esse evento é usado para enviar ou receber dados do servidor quando há conectividade disponível.
// message: é disparado quando o service worker recebe uma mensagem simples de outra parte da aplicação, como a janela principal ou outro service worker. Esse evento é usado para comunicar dados entre o service worker e a aplicação.
// const broadcast = new BroadcastChannel('notifications')
// broadcast.postMessage(JSON.stringify(event))
// broadcast.close()

class IndexedDataBaseController {
    static async handler(client, event) {
        const data = event.data.data
        if (data.execute) {
            const result = await IndexedDataBase.execute(data.execute)
            if (result.request) {
                result.request.onerror = e => {
                    client.postMessage({
                        id: event.data.id,
                        data: {
                            error: e.target.error
                        },
                        manager: event.data.manager,
                    })
                }
                result.request.onsuccess = e => {
                    const cursor = e.target.result
                    if (cursor && cursor.value) {
                        cursor.continue()
                    }
                    client.postMessage({
                        id: event.data.id,
                        data: cursor && cursor.value ? cursor.value : null,
                        manager: event.data.manager,
                    })
                }
            }
        }
        throw new Error('undefined command')
    }
}

self.addEventListener('activate', event => {
    // const broadcast = new BroadcastChannel('notifications')
    // broadcast.postMessage({title:'ativado o sw'})
    // broadcast.close()
})

self.addEventListener('message', async event => {
    // ExtendableMessageEvent
    console.log(event)
    const id = event.data.id ? event.data.id : 0
    const manager = event.data.manager ? event.data.manager : 'global'
    const data = event.data.data ? event.data.data : {}
    const client = await clients.get(event.source.id)
    if (client) {
        const response = {
            id: id,
            manager: manager,
            data: null,
        }
        try {
            switch (manager) {
                case 'database':
                    response.data = await IndexedDataBaseController.handler(client, event)
                    break
                default:
                    break
            }
        } catch (error) {
            response.data = {
                error: error,
            }
        }
        client.postMessage(response)
    }
})