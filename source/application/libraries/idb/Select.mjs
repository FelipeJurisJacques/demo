import { IndexedDataBaseSharedWorker } from "../../worker/IndexedDataBaseSharedWorker.mjs"
import { Observer } from "../observer/Observer.mjs"
import { ServiceWorker } from "../sw/ServiceWorker.mjs"

export class Select extends Observer {
    #id
    #mode
    #trace
    #table
    #queue
    #tables
    #storage
    #request
    #database
    #asynchronous

    /**
     * @var {number}
     */
    #count

    /**
     * @var {IDBIndex}
    */
    #index

    /**
     * @var {number}
     */
    #limit

    /**
     * @var {IDBKeyRange}
     */
    #range

    /**
     * @var {Event}
     */
    #event

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {string}
     */
    #column

    /**
     * @var {Function}
     */
    #having

    /**
     * @var string[]
     */
    #select

    /**
     * @var {Model}
     */
    #prototype

    constructor(stream) {
        super()
        this.#mode = stream.mode
        this.#queue = []
        this.#trace = stream.trace
        this.#table = stream.table
        this.#tables = stream.tables
        this.#database = stream.database
        this.#prototype = stream.prototype
        this.#asynchronous = []
        ServiceWorker.message.subscribe(this)
    }

    notify(message) {
        if (
            message.data
            && message.id === this.#id
            && message.manager === 'database'
        ) {
            if (typeof message.data === 'object' && message.data instanceof Error) {
                throw message.data
            }
            this.#queue.push(message.data)
            if (this.#asynchronous.length > 0) {
                const event = this.#asynchronous.shift()
                event(message.data)
            }
        }
        console.log(message)
    }

    /**
     * @param {string} column
     * @param {string} comparator
     * @param {any} value
     * @returns {void}
     */
    where(column, comparator = '=', value) {
        if (column) {
            this.#column = column
        }
        switch (comparator) {
            case '<':
                this.#range = IDBKeyRange.lowerBound(value, false)
                break
            case '<=':
                this.#range = IDBKeyRange.lowerBound(value, true)
                break
            case '>':
                this.#range = IDBKeyRange.upperBound(value, false)
                break
            case '>=':
                this.#range = IDBKeyRange.upperBound(value, true)
                break
            case '=':
            default:
                this.#range = IDBKeyRange.only(value)
                break
        }
    }

    /**
     * @param {Function} callback 
     * @returns {void}
     */
    having(callback) {
        this.#having = callback
    }

    limit(value) {
        this.#limit = value
    }

    fetch() {
        return new Promise((resolve, reject) => {
            if (this.#queue.length > 0) {
                resolve(this.#queue.shift())
            } else {
                this.#asynchronous.push(value => {
                    if (!value || !value instanceof Error) {
                        resolve(value)
                    } else {
                        reject(value)
                    }
                })
            }
            if (!this.#id) {
                this.#id = this.#post({
                    execute: {
                        mode: this.#mode,
                        trace: this.#trace,
                        table: this.#table,
                        index: null,
                        range: null,
                        tables: this.#tables,
                        cursor: true,
                        database: this.#database,
                        direction: null,
                    }
                })
            }
        })
    }

    #fetch() {
        return new Promise((resolve, reject) => {
            if (this.#error) {
            } else if (this.#event) {
                const cursor = this.#event.target.result
                this.#event = null
                if (cursor) {
                    if (cursor.value) {
                        this.#count++
                        if (!this.#limit || this.#limit > this.#count) {
                            cursor.continue()
                        }
                        resolve(cursor.value)
                    } else {
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            } else {
                this.#queue.push(value => {
                    if (value && value instanceof Error) {
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            }
        })
    }

    async all() {
        const list = []
        while (true) {
            let value = await this.fetch()
            if (!value) {
                break
            }
            list.push(value)
        }
        return list
    }

    #cursor() {
        this.#count = 0
        this.#queue = []
        if (
            this.#column
            && (!this.#storage.keyPath || (
                this.#storage.keyPath
                && this.#storage.keyPath !== this.#column
            ))
        ) {
            this.#index = this.#storage.index(this.#column)
        }
        if (this.#range) {
            this.#request = this.#index ? this.#index.openCursor(this.#range) : this.#storage.openCursor(this.#range)
        } else {
            this.#request = this.#index ? this.#index.openCursor() : this.#storage.openCursor()
        }
        this.#request.onerror = event => {
            this.#error = event.target.error ? event.target.error : new Error('Error to fetch')
            for (let reject of this.#queue) {
                reject(this.#error)
            }
        }
        this.#request.onsuccess = event => {
            if (this.#queue.length > 0) {
                const cursor = event.target.result
                const resolve = this.#queue.shift()
                if (cursor) {
                    if (cursor.value) {
                        this.#count++
                        if (!this.#limit || this.#limit > this.#count) {
                            cursor.continue()
                        }
                        resolve(cursor.value)
                    } else {
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            } else {
                this.#event = event
            }
        }
    }

    #post(data) {
        return ServiceWorker.message.request(data, 'database')
    }
}