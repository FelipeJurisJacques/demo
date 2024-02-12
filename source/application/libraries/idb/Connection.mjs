import { Transaction } from "./Transaction.mjs"

export class Connection {
    #name
    #error
    #queue
    #opening
    #database
    #transactions

    constructor(name) {
        this.#name = name
        this.#queue = []
        this.#opening = false
        this.#transactions = []
    }

    get name() {
        return this.#name
    }

    get opened() {
        return this.#database ? true : false
    }

    open(version, upgrade) {
        if (this.#opening) {
            return
        }
        const db = window.indexedDB
        if (!db) {
            throw new Error('Unsupported IndexedDB')
        }
        this.#opening = true
        const open = version ? db.open(this.#name, version) : db.open(this.#name)
        if (upgrade) {
            open.onupgradeneeded = upgrade
        }
        open.onerror = event => {
            this.#opening = false
            this.#error = event.target.error
            while (this.#queue.length > 0) {
                this.#queue.shift()()
            }
        }
        open.onsuccess = event => {
            this.#opening = false
            this.#database = event.target.result
            while (this.#queue.length > 0) {
                this.#queue.shift()()
            }
        }
    }

    transaction(parameters) {
        for (let transaction of this.#transactions) {
            let contains = true
            for (let table of parameters.tables) {
                if (transaction.tables.indexOf(table) < 0) {
                    contains = false
                    break
                }
            }
            if (contains) {
                for (let origin of parameters.trace) {
                    if (
                        origin.at === transaction.origin.at
                        && origin.file === transaction.origin.file
                        && origin.line > transaction.origin.line
                    ) {
                        return transaction
                    }
                }
            }
        }
        const statement = new Transaction({
            origin: parameters.trace[0],
            tables: parameters.tables,
            transaction: new Promise((resolve, reject) => {
                if (this.#error) {
                    reject(this.#error)
                } else if (this.#database) {
                    resolve(this.#database.transaction(parameters.tables, parameters.mode))
                } else {
                    this.#queue.push(() => {
                        if (this.#database) {
                            resolve(this.#database.transaction(parameters.tables, parameters.mode))
                        } else {
                            reject(this.#error ? this.#error : new Error('database is not opened'))
                        }
                    })
                }
            })
        })
        this.#transactions.push(statement)
        statement.subscribe((event, origin) => {
            if (event.target instanceof IDBTransaction) {
                switch (event.type) {
                    case 'abort':
                    case 'error':
                    case 'complete':
                        for (let index in this.#transactions) {
                            if (this.#transactions[index] === origin) {
                                this.#transactions.splice(index, 1)
                            }
                        }
                        break
                    default:
                        break
                }
            }
        })
        return statement
    }

    close() {
        if (this.#database) {
            this.#database.close()
            this.#database = null
        }
    }
}