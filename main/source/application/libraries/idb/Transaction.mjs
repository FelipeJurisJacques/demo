import { Query } from "./Query.mjs"
import { Subject } from "../observer/Subject.mjs"

export class Transaction extends Subject {

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {function[]}
     */
    #queue

    /**
     * @var {object}
     */
    #origin

    /**
     * @var {string[]}
     */
    #tables

    /**
     * @var {IDBObjectStore[]}
     */
    #storages

    /**
     * @var {IDBTransaction}
     */
    #transaction

    constructor(stream) {
        super()
        this.#origin = stream.origin
        this.#queue = []
        this.#tables = stream.tables
        this.#storages = []
        this.subscribe(event => {
            switch (event.type) {
                case 'abort':
                case 'error':
                    this.#error = event.target.error
                    break
                case 'complete':
                    this.#transaction = null
                    break
                default:
                    break
            }
        })
        const promise = stream.transaction
        promise.then(transaction => {
            this.#transaction = transaction
            this.#transaction.onabort = event => {
                this.notify(event)
            }
            this.#transaction.onerror = event => {
                this.notify(event)
            }
            this.#transaction.oncomplete = event => {
                this.notify(event)
            }
            for (let promise of this.#queue) {
                promise(transaction)
            }
        })
        promise.catch(error => {
            this.#error = error
            for (let promise of this.#queue) {
                promise(error)
            }
        })
    }

    get origin() {
        return this.#origin
    }

    get tables() {
        return this.#tables
    }

    /**
     * @param {string} table
     * @param {null|object} prototype
     * @returns {Query}
     */
    query(table, prototype = null) {
        return new Query({
            table: table,
            storage: new Promise((resolve, reject) => {
                if (this.#error) {
                    reject(this.#error)
                    return
                }
                for (let statement of this.#storages) {
                    if (statement instanceof IDBObjectStore) {
                        if (table === statement.name) {
                            resolve(statement)
                            return
                        }
                    }
                }
                if (this.#transaction) {
                    const storage = this.#transaction.objectStore(table)
                    this.#storages.push(storage)
                    resolve(storage)
                    return
                }
                this.#queue.push(data => {
                    if (data instanceof IDBTransaction) {
                        resolve(data.objectStore(table))
                    } else if (data instanceof Error) {
                        reject(data)
                    } else {
                        reject(new Error('transaction is failed'))
                    }
                })
            }),
            prototype: prototype,
        })
    }

    commit() {
        if (this.#transaction) {
            this.#transaction.commit()
        }
    }

    abort() {
        if (this.#transaction) {
            this.#transaction.abort()
        }
    }
}