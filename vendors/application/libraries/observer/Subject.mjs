import { Observer } from "./Observer.mjs"

export class Subject {
    #handlers

    constructor() {
        this.#handlers = []
    }

    /**
     * @param {Observer} observer 
     * @returns {void}
     */
    subscribe(observer) {
        this.#handlers.push(observer)
    }

    /**
     * @param {Observer} observer 
     * @returns {void}
     */
    unsubscribe(observer) {
        for (let i in this.#handlers) {
            if (this.#handlers[i] === observer) {
                this.#handlers.splice(i, 1)
            }
        }
    }

    /**
     * @param {*} data
     * @returns {void}
     */
    notify(data = null) {
        for (let handler of this.#handlers) {
            if (typeof handler === 'object' && handler instanceof Observer) {
                handler.notify(data, this)
            } else if (typeof handler === 'function') {
                handler(data, this)
            }
        }
    }
}