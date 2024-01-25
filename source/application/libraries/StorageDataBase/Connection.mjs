import { Query } from "./Query.mjs"
import { Transaction } from "./Transaction.mjs"

export class Connection {

    /**
     * @var {string}
     */
    #name

    /**
     * @var {boolean}
     */
    #state

    /**
     * @var {IDBDatabase}
     */
    #database

    /**
     * @var {number}
     */
    #interaction

    /**
     * @var {Array<IndexedDataBaseTransaction>}
     */
    #transactions

    /**
     * @param {string} name
     * @returns {Connection}
     */
    static from(name) {
        if (this.#connections) {
            for (let connection of this.#connections) {
                if (connection.name === name) {
                    return connection
                }
            }
        }
        const connection = new Connection(name)
        this.#connections.push()
        return connection
    }

    /**
     * @param {string} name
     */
    constructor(name) {
        this.#name = name
        this.#state = false
        this.#interaction = 0
        this.#transactions = []
    }

    /**
     * @returns {string}
     */
    get name() {
        return this.#name
    }

    /**
     * @returns {boolean}
     */
    get opened() {
        return this.#state && this.#database
    }

    /**
     * @method static
     * @returns {IDBFactory}
     */
    get indexedDB() {
        if (window.indexedDB) {
            return window.indexedDB
        } else {
            throw new UnsupportedError('Unsupported IndexedDB')
        }
    }

    /**
     * @returns {Transaction[]}
     */
    get transactions() {
        return this.#transactions
    }

    /**
     * @returns {number}
     */
    get version() {
        return this.#database ? this.#database.version : 0
    }

    /**
     * @returns {string[]}
     */
    get storages() {
        const list = []
        for (let name of this.#database.objectStoreNames) {
            list.push(name)
        }
        return list
    }

    /**
     * @param {number|null} version 
     * @param {function|null} upgrade 
     * @returns {Promise}
     */
    open(version = null, upgrade = null) {
        return new Promise(async (resolve, reject) => {
            this.#state = true
            this.#transactions = []
            // IDBOpenDBRequest
            const open = version ? this.indexedDB.open(this.#name, version) : this.indexedDB.open(this.#name)
            open.onerror = event => {
                this.#state = false
                const error = event.target.error
                console.error(error)
                reject(error)
            }
            open.onsuccess = () => {
                this.#database = open.result
                console.log(`Database ${this.name} opened`)
                resolve()
            }
            if (upgrade) {
                open.onupgradeneeded = event => {
                    upgrade(new Upgrade(event))
                }
            }
        })
    }

    close() {
        if (this.#database) {
            this.#database.close()
            console.log(`Database ${this.name} closed`)
        }
        this.#transactions = []
        this.#state = false
    }

    drop() {
        return new Promise(async (resolve, reject) => {
            // IDBOpenDBRequest
            const open = this.indexedDB.deleteDatabase(this.name)
            this.#state = true
            open.onerror = event => {
                this.#state = false
                reject(event.target.error ? event.target.error : new Error(`Error to drop database ${this.name}`))
            }
            open.onsuccess = event => {
                this.#state = false
                resolve()
            }
            this.#transactions = []
        })
    }

    #autoClose() {
        if (this.opened) {
            this.interaction++
            const interaction = this.#interaction
            setTimeout(() => {
                if (this.opened) {
                    if (interaction === this.#interaction) {
                        let done = 0
                        if (this.transactions.length > 0) {
                            for (let transaction of this.transactions) {
                                if (transaction.done) {
                                    done++
                                }
                            }
                        }
                        if (done === this.transactions.length) {
                            this.close()
                        }
                    }
                }
            }, 1000)
        }
    }

    /**
     * @var {DataBaseConnection[]}
     */
    static #connections = []

    /**
     * @param {string} name
     * @returns {DataBaseConnection}
     */
    static from(name) {
        if (this.#connections) {
            for (let connection of this.#connections) {
                if (connection.name === name) {
                    return connection
                }
            }
        }
        const connection = new Connection(name)
        this.#connections.push()
        return connection
    }

    /**
     * @param {string|string[]} names
     * @param {boolean} write
     * @returns {Promise<Transaction>}
     */
    async transaction(names, write = true) {
        if (!this.opened) {
            await this.open()
        }
        let n = []
        const list = typeof names === 'string' ? [names] : names
        for (let name of list) {
            for (let store of this.#database.objectStoreNames) {
                if (store === name || store === `${name}_data`) {
                    n.push(store)
                }
            }
        }
        if (n.length === 0) {
            throw new Error('Storage names not found')
        }
        if (n.length > 1) {
            n = n.sort()
        }
        return new Transaction(this.#database.transaction(
            n,
            write ? 'readwrite' : 'readonly'
        ))
    }

    /**
     * @param {String[]} columns 
     * @returns {Promise<Query>}
     */
    async select(columns = []) {
        if (!this.opened) {
            await this.open()
        }
        const statement = new Query(this.#database)
        statement.select(columns)
        return statement
    }
}