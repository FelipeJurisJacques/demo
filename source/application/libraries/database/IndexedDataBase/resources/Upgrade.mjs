import { Schema } from "../Schema.mjs"

export class Upgrade {

    /**
     * @var {IDBVersionChangeEvent}
     */
    #event

    /**
     * @var {IDBDatabase}
     */
    #connection

    /**
     * @param {IDBVersionChangeEvent} event 
     */
    constructor(event) {
        this.#event = event
        this.#connection = event.target.result
    }

    /**
     * @param {string} name 
     * @returns {Schema}
     */
    table(name) {
        return new Schema(this.#connection, name)
    }
}