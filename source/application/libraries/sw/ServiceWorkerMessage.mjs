import { Subject } from "../../utils/Subject.mjs"
import { ServiceWorker } from "./ServiceWorker.mjs"

export class ServiceWorkerMessage extends Subject {

    /**
     * @var {number}
     */
    static #uuid = 1

    /**
     * @var {object}
     */
    static #asynchronous = {}

    constructor() {
        super()
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data) {
                    const uuid = event.data.uuid
                    if (uuid && this.constructor.#asynchronous[uuid]) {
                        try {
                            this.constructor.#asynchronous[uuid](event)
                        } catch (error) {
                            console.error(error)
                        }
                        delete this.constructor.#asynchronous[uuid]
                    }
                }
                this.notify(event)
            })
        }
    }

    /**
     * @param {*} message
     * @param {string} manager
     * @returns {Promise<number>}
     */
    async post(message, manager = '') {
        const uuid = this.constructor.#uuid++
        const worker = await ServiceWorker.getWorker()
        worker.postMessage({
            uuid: uuid,
            manager: manager,
            payload: message,
        })
        return uuid
    }

    /**
     * @param {*} message
     * @param {string} manager
     * @param {number} timeout
     * @returns {Promise<object>}
     */
    request(message, manager = '', timeout = 1000) {
        return new Promise((resolve, reject) => {
            ServiceWorker.getWorker().then(worker => {
                const uuid = this.constructor.#uuid++
                this.constructor.#asynchronous[uuid] = event => {
                    resolve(event.data)
                }
                worker.postMessage({
                    uuid: uuid,
                    manager: manager,
                    payload: message,
                })
                setTimeout(() => {
                    if (this.constructor.#asynchronous[uuid]) {
                        delete this.constructor.#asynchronous[uuid]
                        reject(new Error('timeout'))
                    }
                }, timeout)
            })
        })
    }
}