importScripts(new URL(
    `${location.origin}/source/application/worker/libraries/observer/Subject.js`
))

class MessageWorker extends Subject {

    constructor() {
        super()
        self.addEventListener('message', async event => {
            if (event instanceof ExtendableMessageEvent) {
                this.notify({
                    id: event.data.id ? event.data.id : null,
                    data: event.data.data ? event.data.data : null,
                    event: event,
                    client: await clients.get(event.source.id),
                    manager: event.data.manager ? event.data.manager : 'global',
                })
            }
        })
    }

    notify(data, target) {
        try {
            super.notify(data, target)
        } catch (error) {
            if (stream.client) {
                stream.client.postMessage({
                    id: stream.id,
                    manager: stream.manager,
                    data: error,
                })
            }
        }
    }
}