import { Select } from "./Select.mjs"

export class Query {

    #error
    #queue

    /**
     * @var {IDBObjectStore}
     */
    #storage
    #prototype

    constructor(stream) {
        this.#queue = []
        this.#prototype = stream.prototype
        const promise = stream.storage
        promise.then(storage => {
            this.#storage = storage
            for (let promise of this.#queue) {
                promise(storage)
            }
        })
        promise.catch(error => {
            this.#error = error
            for (let promise of this.#queue) {
                promise(error)
            }
        })
    }

    /**
     * @returns {Promise<string>}
     */
    get key() {
        return new Promise((resolve, reject) => {
            if (this.#error) {
                reject(this.#error)
            } else if (this.#storage) {
                resolve(this.#storage.keyPath)
            } else {
                this.#queue.push(data => {
                    if (data instanceof IDBObjectStore) {
                        resolve(data.keyPath)
                    } else if (data instanceof Error) {
                        reject(data)
                    } else {
                        reject(new Error('transaction is failed'))
                    }
                })
            }
        })
    }

    select() {
        return new Select({
            storage: this.#getStorage(),
            prototype: this.#prototype,
        })
    }

    insert(data) {
        return new Promise(async (resolve, reject) => {
            if (this.#serializable(data)) {
                const storage = await this.#getStorage()
                const request = storage.add(data)
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

    update(data) { }

    #getStorage() {
        return new Promise((resolve, reject) => {
            if (this.#error) {
                reject(this.#error)
            } else if (this.#storage) {
                resolve(this.#storage)
            } else {
                this.#queue.push(data => {
                    if (data instanceof IDBObjectStore) {
                        resolve(data)
                    } else if (data instanceof Error) {
                        reject(data)
                    } else {
                        reject(new Error('transaction is failed'))
                    }
                })
            }
        })
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