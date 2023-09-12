import { Observer } from "./Observer.mjs"

export class Subject {
    #handlers

    constructor() { }

    /**
     * @param {Observer} observer 
     * @returns {void}
     */
    subscribe(observer) {
        if (!this.#handlers) {
            this.#handlers = []
        }
        this.#handlers.push(observer)
    }

    /**
     * @param {Observer} observer 
     * @returns {void}
     */
    unsubscribe(observer) {
        if (this.#handlers) {
            for (let i in this.#handlers) {
                if (this.#handlers[i] === observer) {
                    this.#handlers.splice(i, 1)
                }
            }
        }
    }

    /**
     * @param {*} data
     * @returns {void}
     */
    notify(data = null) {
        if (this.#handlers) {
            for (let handler of this.#handlers) {
                handler.notify(data)
            }
        }
    }
}