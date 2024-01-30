import { Asynchronous } from "../../utils/Asynchronous.mjs"
import { ServiceWorkerMessage } from "./ServiceWorkerMessage.mjs"

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
     * @returns {ServiceWorkerMessage}
     */
    static get message() {
        if (!this.#message) {
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