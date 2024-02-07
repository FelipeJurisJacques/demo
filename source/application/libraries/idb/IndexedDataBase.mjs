import { Transaction } from "./Transaction.mjs"
import { IndexedDataBaseSharedWorker } from "../../worker/IndexedDataBaseSharedWorker.mjs"

export class IndexedDataBase {

    #id
    #name
    #opened
    #worker
    #subscription

    constructor(database) {
        this.#name = database
        this.#opened = false
        this.#worker = new IndexedDataBaseSharedWorker(this.#name)
        this.#worker.subscribe(message => {
            if (message.manager === 'connection') {
                this.#id = message.id
                this.#opened = message.opened
            }
        })
    }

    /**
     * @returns {number}
     */
    get id() {
        return this.#id
    }

    /**
     * @returns {boolean}
     */
    get opened() {
        return this.#opened
    }

    /**
     * @param {number} version
     * @param {function} upgrade
     * @returns {Promise<void>}
     */
    async open(version, upgrade) {
        if (!this.#id || !this.#opened) {
            this.#subscription = await this.#worker.post({
                open: {
                    upgrade: upgrade ? upgrade : null,
                    version: version ? version : null,
                    database: this.#name,
                },
            }, 'connection')
        }
    }

    close() {
        if (this.#id) {
            this.#worker.post({
                close: this.#id,
            })
        }
    }

    /**
     * 
     * @param {string|string[]} tables
     * @param {boolean} write
     * @returns {Transaction}
     */
    transaction(tables, write = false) {
        if (!this.#opened) {
            this.open()
        }
        return new Transaction({
            mode: write ? 'readwrite' : 'readonly',
            trace: this.#trace(),
            tables: typeof tables === 'string' ? [tables] : tables,
            worker: this.#worker,
            connection: this,
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