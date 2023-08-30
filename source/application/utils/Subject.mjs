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
     * @param {*} data
     * @returns {void}
     */
    notify(data) {
        if (this.#handlers) {
            for (let handler of this.#handlers) {
                handler.notify(data)
            }
        }
    }
}