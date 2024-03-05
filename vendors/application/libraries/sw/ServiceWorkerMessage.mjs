import { Subject } from "../observer/Subject.mjs"
import { ServiceWorker } from "./ServiceWorker.mjs"

export class ServiceWorkerMessage extends Subject {

    /**
     * @var {number}
     */
    static #id

    /**
     * @var {object}
     */
    static #asynchronous

    constructor() {
        super()
        if (!this.constructor.#id && !this.constructor.#asynchronous && 'serviceWorker' in navigator) {
            this.constructor.#id = 1
            this.constructor.#asynchronous = {}
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data) {
                    const id = event.data.id
                    if (id && this.constructor.#asynchronous[id]) {
                        try {
                            this.constructor.#asynchronous[id](event)
                        } catch (error) {
                            console.error(error)
                        }
                        delete this.constructor.#asynchronous[id]
                    }
                }
                this.notify(event.data)
            })
        }
    }

    /**
     * @param {*} message
     * @param {string} manager
     * @returns {number}
     */
    post(message, manager = '') {
        const id = this.constructor.#id++
        ServiceWorker.getWorker().then(worker => {
            worker.postMessage({
                id: id,
                manager: manager,
                data: message,
            })
        })
        return id
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
                const id = this.constructor.#id++
                this.constructor.#asynchronous[id] = event => {
                    resolve(event.data)
                }
                worker.postMessage({
                    id: id,
                    data: message,
                    manager: manager,
                })
                setTimeout(() => {
                    if (this.constructor.#asynchronous[id]) {
                        delete this.constructor.#asynchronous[id]
                        reject(new Error('timeout'))
                    }
                }, timeout)
            })
        })
    }
}