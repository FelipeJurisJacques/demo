import { Connection } from "./Connection.mjs"
import { Transaction } from "./resources/Transaction.mjs"

export class Query {

    /**
     * @var {int}
     */
    #mode

    /**
     * @var {string}
    */
    #index

    /**
     * @var {IDBKeyRange}
     */
    #range

    /**
     * @var {string}
     */
    #table

    /**
     * @var {Cursor}
     */
    #cursor

    /**
     * @var {function}
     */
    #having

    /**
     * @var {Transaction}
     */
    #transaction

    /**
     * @var {Connection}
     */
    #connection

    /**
     * @param {string} name 
     * @returns {Query}
     */
    static connection(name) {
        return new Query(Connection.from(name))
    }

    /**
     * @param {string} index
     * @param {any} value
     * @returns {object}
     */
    static equal(index, value) {
        return {
            index: index,
            range: IDBKeyRange.only(value),
        }
    }

    /**
     * @param {string} index
     * @param {any} value
     * @param {bool} equal
     * @returns {object}
     */
    static lowerBound(index, value, equal = false) {
        return {
            index: index,
            range: IDBKeyRange.lowerBound(value, equal),
        }
    }

    /**
     * @param {string} index
     * @param {any} value
     * @param {bool} equal
     * @returns {object}
     */
    static upperBound(index, value, equal = false) {
        return {
            index: index,
            range: IDBKeyRange.upperBound(value, equal),
        }
    }

    /**
     * @param {Connection|Transaction} stream
     */
    constructor(stream) {
        if (stream instanceof Transaction) {
            this.#transaction = stream
        } else {
            this.#connection = stream
        }
    }

    /**
     * @param {string} table 
     * @returns {void}
     */
    from(table) {
        this.#table = table
    }

    /**
     * @param {object} operator
     * @returns {void}
     */
    where(operator) {
        this.#index = operator.index
        this.#range = operator.range
    }

    /**
     * @var {function} having
     * @returns {void}
     */
    having(callback) {
        this.#having = callback
    }

    async find(id) {
        if (!this.#transaction) {
            await this.#connection.open()
            this.#transaction = this.#connection.transaction(this.#table)
        }
        const index = this.#transaction.storage(this.#table)
        if (this.#contains(this.#transaction.names, `${this.#table}_data`)) {
            const storage = this.#transaction.storage(`${this.#table}_data`)
            const content = await storage.get(value[data.key])
            if (content) {
                for (let key in content) {
                    value[key] = content[key]
                }
            }
        } else {
            return await index.get(id)
        }
    }

    async add(value) {
        if (!this.#transaction) {
            await this.#connection.open()
            this.#transaction = this.#connection.transaction([
                this.#table,
            ], true)
        }
        const index = this.#transaction.storage(this.#table)
        if (this.#contains(this.#transaction.names, `${this.#table}_data`)) {
            const data = this.#transaction.storage(`${this.#table}_data`)
            const indexes = index.indexes
            const part_1 = {}
            const part_2 = {}
            for (let key in value) {
                if (this.#contains(indexes, key)) {
                    part_1[key] = value[key]
                } else {
                    part_2[key] = value[key]
                }
            }
            const id = await index.add(part_1)
            part_2[index.key] = id
            await data.add(part_2)
            return id
        } else {
            return await index.add(value)
        }
    }

    fetch() {
        return new Promise(async resolve => {
            await this.#start()
            let value = null
            while (!value) {
                let v = await this.#cursor.fetch()
                if (!v) {
                    break
                } else if (!this.#having && this.#having(value)) {
                    value = v
                }
            }
            if (value) {
                if (this.#contains(this.#transaction.names, `${this.#table}_data`)) {
                    const storage = this.#transaction.storage(`${this.#table}_data`)
                    const content = await storage.get(value[data.key])
                    if (content) {
                        for (let key in content) {
                            value[key] = content[key]
                        }
                    }
                }
            }
            resolve(value)
        })
    }

    all() {

    }

    async #start() {
        if (!this.#cursor) {
            if (!this.#transaction) {
                await this.#connection.open()
                this.#transaction = this.#connection.transaction(this.#table, false)
            }
            const storage = this.#transaction.storage(this.#table)
            if (this.#index) {
                const index = storage.index(this.#index)
                this.#cursor = index.cursor(this.#range)
            } else {
                this.#cursor = storage.cursor()
            }
        }
    }

    #contains(list, search) {
        for (let value of list) {
            if (value === search) {
                return true
            }
        }
        return false
    }
}