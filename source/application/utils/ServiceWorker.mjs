import { Subject } from "./Subject.mjs"
import { Calendar } from "./Calendar.mjs"
import { Observer } from "./Observer.mjs"
import { Asynchronous } from "./Asynchronous.mjs"
import { Cryptography } from "./Cryptography.mjs"

export class ServiceWorkerMessageObserver extends Observer {
    uuid
    manager
    #message

    constructor() {
        super()
    }

    /**
     * @param {object} data
     * @returns {void}
     */
    notify(data) {
        if (
            data.uuid
            && data.uuid === this.uuid
            && (
                !this.manager
                || (
                    data.manager
                    && data.manager === this.manager
                )
            )
        ) {
            this.#message = data
        }
    }

    /**
     * @param {int} timeout
     * @returns {Promise}
     */
    async wait(timeout = 1000) {
        timeout += Calendar.timestamp()
        let moment = 0
        while (moment < timeout) {
            if (this.#message) {
                return this.#message
            }
            await Asynchronous.wait(1)
            moment = Calendar.timestamp()
        }
        throw new Error('Timeout')
    }
}

class ServiceWorkerMessage extends Subject {

    constructor() {
        super()
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                super.notify(event.data)
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
    async request(message, manager = '', timeout = 1000) {
        const uuid = Cryptography.uuid()
        const observer = new ServiceWorkerMessageObserver()
        observer.uuid = uuid
        this.subscribe(observer)
        const worker = await ServiceWorker.getWorker()
        worker.postMessage({
            uuid: uuid,
            manager: manager,
            payload: message,
        })
        try {
            const data = await observer.wait(timeout)
            if (data.payload && data.payload.error) {
                throw new Error(data.payload.error)
            }
            this.unsubscribe(observer)
            return data
        } catch (error) {
            this.unsubscribe(observer)
            throw error
        }
    }
}

export class ServiceWorker {

    /**
     * @var ServiceWorkerRegistration
     */
    static #registration

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
        if (!this.support) {
            throw new Error('ServiceWorker is unsupported')
        }
        return navigator.serviceWorker
    }

    /**
     * @method static
     * @returns {Promise<ServiceWorkerRegistration>}
     */
    static get registration() {
        return this.getRegistration()
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
     * @param {URL|String} url 
     * @returns {Promise<ServiceWorkerRegistration>}
     */
    static async register(url) {
        if (!window.sessionStorage) {
            throw new Error('Session storage is unsupported')
        }
        this.#registration = await this.container.register(url)
        window.sessionStorage.setItem('service_worker', url)
        return this.#registration
    }

    /**
     * @method static
     * @returns {Promise<ServiceWorkerRegistration>}
     */
    static async getRegistration() {
        if (!window.sessionStorage) {
            throw new Error('Session storage is unsupported')
        }
        if (!this.#registration) {
            let url
            while (!this.#registration) {
                url = window.sessionStorage.getItem('service_worker')
                if (url) {
                    this.#registration = await this.container.register(url)
                    return this.#registration
                }
                await Asynchronous.wait(1)
            }
        }
        return this.#registration
    }

    /**
     * @method static
     * @returns {Promise<ServiceWorker>}
     */
    static async getWorker() {
        if (!this.#worker) {
            const registration = await this.getRegistration()
            while (!this.#worker) {
                if (registration.active) {
                    this.#worker = registration.active
                } else if (registration.installing || registration.waiting) {
                    await Asynchronous.wait(1)
                } else {
                    throw new Error('ServiceWorker script is undefined')
                }
            }
        }
        return this.#worker
    }
}