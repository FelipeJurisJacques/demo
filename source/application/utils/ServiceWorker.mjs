import { Subject } from "./Subject.mjs"
import { Calendar } from "./Calendar.mjs"
import { Asynchronous } from "./Asynchronous.mjs"
import { Cryptography } from "./Cryptography.mjs"

class ServiceWorkerMessage extends Subject {
    #last

    constructor() {
        super()
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                const message = event.data
                this.#last = message
                super.notify(message)
            })
        }
    }

    /**
     * @param {*} message
     * @param {string} manager
     * @returns {Promise<string>}
     */
    async post(message, manager = '') {
        const uuid = Cryptography.uuid()
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
     * @param {int} timeout
     * @returns {Promise}
     */
    async request(message, manager = '', timeout = 30) {
        timeout *= 1000
        const init = Calendar.timestamp()
        const uuid = await this.post(message, manager)
        while ((Calendar.timestamp() - init) < timeout) {
            await Asynchronous.wait(1)
            if (this.#last && this.#last.uuid && this.#last.uuid === uuid) {
                return this.#last
            }
        }
        throw new Error('Timeout')
    }
}

export class ServiceWorker {

    /**
     * @var ServiceWorkerRegistration
     */
    static registration

    /**
     * @var ServiceWorker
     */
    static #worker

    /**
     * @var ServiceWorkerMessage
     */
    static #message

    /**
     * @method static
     * @returns {Promise<ServiceWorker>}
     */
    static get worker() {
        return this.getWorker()
    }

    /**
     * @method static
     * @returns {boolean}
     */
    static get support() {
        return 'serviceWorker' in navigator
    }

    /**
     * @method static
     * @returns {ServiceWorkerContainer}
     */
    static get container() {
        return this.support ? navigator.serviceWorker : undefined
    }

    /**
     * @method static
     * @returns {ServiceWorkerMessage}
     */
    static get message() {
        if (this.#message === undefined) {
            this.#message = new ServiceWorkerMessage()
        }
        return this.#message
    }

    /**
     * @method static
     * @returns {Promise<ServiceWorker>}
     */
    static async getWorker() {
        if (this.#worker === undefined) {
            if (this.container === undefined) {
                throw new Error('ServiceWorker is unsupported')
            }
            while (!this.#worker) {
                if (this.registration === undefined) {
                    await Asynchronous.wait(1)
                } else if (this.registration.active) {
                    this.#worker = this.registration.active
                } else if (this.registration.installing || this.registration.waiting) {
                    await Asynchronous.wait(1)
                } else {
                    throw new Error('ServiceWorker script is undefined')
                }
            }
        }
        return this.#worker
    }

    /**
     * @method static
     * @param {URL|String} url 
     * @returns {Promise<ServiceWorkerRegistration>}
     */
    static async register(url) {
        if (this.container === undefined) {
            throw new Error('ServiceWorker is unsupported')
        }
        this.registration = await this.container.register(url)
        return this.registration
    }
}