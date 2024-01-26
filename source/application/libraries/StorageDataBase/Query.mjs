import { Insert } from "./Insert.mjs"
import { Select } from "./Select.mjs"

export class Query {

    /**
     * @var {IDBObjectStore}
     */
    #data

    /**
     * @var {IDBObjectStore}
     */
    #storage

    static empty(data) {
        if (data) {
            if (typeof data === 'object') {
                const keys = Object.keys(data)
                return keys.length === 0
            }
            return true
        }
        return false
    }

    /**
     * @param {any} data
     * @returns {boolean}
     */
    static serializable(data) {
        if (data) {
            if (typeof data === 'function') {
                return false
            }
            if (typeof data === 'object') {
                if (data instanceof Promise) {
                    return false
                }
                const keys = Object.keys(data)
                for (let key of keys) {
                    if (!this.serializable(data[key])) {
                        return false
                    }
                }
            }
        }
        return true
    }

    /**
     * @param {IDBObjectStore[]} storages
     */
    constructor(storages) {
        for (let storage of storages) {
            if (storage.name.slice(-5) === '_data') {
                this.#data = storage
            } else {
                this.#storage = storage
            }
        }
    }

    get name() {
        return this.#storage.name
    }

    select() {
        return new Select(this.#storage, this.#data)
    }

    insert() {
        return new Insert(this.#storage, this.#data)
    }
}