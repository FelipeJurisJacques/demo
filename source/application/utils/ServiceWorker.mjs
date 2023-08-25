import { Asynchronous } from "./Asynchronous.mjs"

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

    /**
     * @method static
     * @param {string} message 
     * @param {*} transferables 
     */
    static async postMessage(message, transferables = null) {
        (await this.worker).postMessage(message, transferables)
    }
}