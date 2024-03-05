import { Select } from "./Select.mjs"

export class Query {

    /**
     * @var {IDBObjectStore}
     */
    #storage

    /**
     * @var {Model}
     */
    #prototype

    /**
     * @param {object} data
     * @returns {boolean}
     */
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
     * @param {IDBObjectStore} storage
     * @param {Model|null} prototype
     */
    constructor(storage, prototype = null) {
        this.#storage = storage
        if (prototype) {
            this.#prototype = prototype
        }
    }

    get key() {
        return this.#storage.keyPath
    }

    get name() {
        return this.#storage.name
    }

    select() {
        return new Select(this.#storage, this.#prototype)
    }

    /**
     * @param {object} data 
     * @returns {Promise<int|null>}
     */
    insert(data) {
        return new Promise((resolve, reject) => {
            if (this.constructor.empty(data)) {
                reject(new Error('Data is empty'))
            } else if (!this.constructor.serializable(data)) {
                reject(new Error('Data is not serializable'))
            } else {
                const request = this.#storage.add(data)
                request.onerror = event => {
                    reject(event.target.error ? event.target.error : new Error('Error to add'))
                }
                request.onsuccess = event => {
                    resolve(event.target.result ? event.target.result : null)
                }
            }
        })
    }
}