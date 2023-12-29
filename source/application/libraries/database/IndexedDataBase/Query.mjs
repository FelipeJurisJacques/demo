import { Connection } from "./Connection.mjs"

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
     * @returns {self}
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
     * @param {Connection} connection 
     */
    constructor(connection) {
        this.#connection = connection
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

    fetch() {
        return new Promise(async resolve => {
            await this.#start()
            let value = null
            while (true) {
                let v = await this.#cursor.fetch()
                if (!v) {
                    break
                } else if (!this.#having && this.#having(value)) {
                    value = v
                }
            }
            if (value) {
                for (let storage of this.#transaction.storages) {
                    if (
                        storage.key
                        && value[storage.key]
                        && !storage.name.endsWith('_index')
                    ) {
                        let content = storage.get(value[data.key])
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
            await this.#connection.open()
            this.#transaction = this.#connection.transaction([
                `${this.#table}_data`,
                `${this.#table}_index`,
            ], false)
            const storage = this.#transaction.storage(`${this.#table}_index`)
            if (this.#index) {
                const index = storage.index(this.#index)
                this.#cursor = index.cursor(this.#range)
            } else {
                this.#cursor = storage.cursor()
            }
        }
    }
}