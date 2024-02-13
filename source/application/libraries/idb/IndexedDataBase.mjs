import { Connection } from "./Connection.mjs"
import { Transaction } from "./Transaction.mjs"

export class IndexedDataBase {

    /**
     * @var {Connection[]}
     */
    static #connections = []

    /**
     * @var {Connection}
     */
    #connection

    constructor(database) {
        for (let connection of this.constructor.#connections) {
            if (database === connection.name) {
                this.#connection = connection
            }
        }
        if (!this.#connection) {
            this.#connection = new Connection(database)
            this.constructor.#connections.push(this.#connection)
        }
    }

    /**
     * @returns {boolean}
     */
    get opened() {
        return this.#connection.opened
    }

    /**
     * @param {string|string[]} tables
     * @param {boolean} write
     * @returns {Transaction}
     */
    transaction(tables, write = false) {
        if (!this.#connection.opened) {
            this.#connection.open()
        }
        return this.#connection.transaction({
            mode: write ? 'readwrite' : 'readonly',
            trace: this.#trace(),
            tables: typeof tables === 'string' ? [tables] : tables,
        })
    }

    #trace() {
        const error = new Error()
        const list = []
        for (let trace of error.stack.split('\n')) {
            trace = trace.trim()
            if (!trace.startsWith('at')) {
                continue
            }
            let parts = trace.split(' ')
            let item = {
                at: '',
                line: '',
                file: '',
            }
            item.file = parts.pop()
            item.at = parts.pop()
            if (item.at.indexOf('.') < 0) {
                continue
            }
            parts = item.at.split('.')
            if (parts.shift() === this.constructor.name) {
                continue
            }
            item.file = item.file.substring(1, item.file.length - 2)
            parts = item.file.split(':')
            parts.pop()
            item.line = parseInt(parts.pop())
            item.file = parts.join(':')
            list.push(item)
        }
        return list
    }
}