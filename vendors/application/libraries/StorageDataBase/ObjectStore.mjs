import { Index } from "./Index.mjs"
import { Cursor } from "./Cursor.mjs"

export class ObjectStore {

    /**
     * @var {IDBObjectStore}
     */
    #storage

    /**
     * @param {IDBObjectStore} storage
     */
    constructor(storage) {
        this.#storage = storage
    }

    /**
     * @var {string|null}
     */
    get key() {
        return this.#storage.keyPath
    }

    get name() {
        return this.#storage.name
    }

    /**
     * @returns {string[]}
     */
    get indexes() {
        const list = []
        for (let name of this.#storage.indexNames) {
            list.push(name)
        }
        return list
    }

    /**
     * @throws {DOMException}
     * @param {string} key
     * @returns {Index}
     */
    index(key) {
        return new Index(this.#storage.index(key))
    }

    /**
     * @param {object} data 
     * @returns {Promise<int>}
     */
    add(data) {
        return new Promise((resolve, reject) => {
            if (this.#serializable(data)) {
                const request = this.#storage.add(data)
                request.onerror = event => {
                    reject(event.target.error)
                }
                request.onsuccess = event => {
                    resolve(event.target.result ? event.target.result : null)
                }
            } else {
                reject(new Error('value to insert is not serializable'))
            }
        })
    }

    /**
     * @param {number} id 
     * @returns {Promise<object>}
     */
    get(id) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.get(id)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get'))
            }
            request.onsuccess = event => {
                resolve(event.target.result ? event.target.result : null)
            }
        })
    }

    /**
     * @returns {Promise<Array<Object>>}
     */
    all() {
        return new Promise((resolve, reject) => {
            const request = this.#storage.getAll()
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get all'))
            }
            request.onsuccess = () => {
                resolve(request.result ? request.result : null)
            }
        })
    }

    /**
     * @param {object} data 
     * @param {number} id 
     * @returns {Promise<number>}
     */
    put(data, id = 0) {
        return new Promise((resolve, reject) => {
            const request = id > 0 ? this.#storage.put(data, id) : this.#storage.put(data)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to put'))
            }
            request.onsuccess = event => {
                resolve(event.target.result)
            }
        })
    }

    /**
     * @param {number} id 
     * @returns {Promise}
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.delete(id)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to delete'))
            }
            request.onsuccess = () => {
                resolve()
            }
        })
    }

    /**
     * @returns {Promise<boolean>}
     */
    empty() {
        return new Promise((resolve, reject) => {
            const request = this.#storage.openCursor()
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to open cursor'))
            }
            request.onsuccess = () => {
                resolve(!request.result)
            }
        })
    }

    /**
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    has(id) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.get(id)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get'))
            }
            request.onsuccess = () => {
                resolve(request.result ? true : false)
            }
        })
    }

    /**
     * @returns {Cursor}
     */
    cursor() {
        return new Cursor(this.#storage.openCursor())
    }

    #serializable(data) {
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
                    if (!this.#serializable(data[key])) {
                        return false
                    }
                }
            }
        }
        return true
    }
}