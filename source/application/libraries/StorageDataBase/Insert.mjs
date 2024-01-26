import { Query } from "./Query.mjs"

export class Insert {

    /**
     * @var {IDBObjectStore}
     */
    #data

    /**
     * @var {IDBObjectStore}
     */
    #storage

    /**
     * @param {IDBObjectStore} storage
     * @param {IDBObjectStore} data
     */
    constructor(storage, data) {
        this.#storage = storage
        this.#data = data
    }

    /**
     * @param {object} data
     * @returns Promise<int|null>
     */
    async add(data = {}) {
        const index = {}
        for (let key in data) {
            if (key === this.#storage.keyPath) {
                index[key] = data[key]
                delete data[key]
            } else {
                for (let name of this.#storage.indexNames) {
                    if (key === name) {
                        index[key] = data[key]
                        delete data[key]
                    }
                }
            }
        }
        const id = await this.#add(this.#storage, index)
        if (!id || Query.empty(data)) {
            return id
        }
        data.id = id
        await this.#add(this.#data, data)
        return id
    }

    #add(storage, data) {
        return new Promise((resolve, reject) => {
            if (!Query.serializable(data)) {
                reject(new Error('Data is not serializable'))
            } else {
                const request = storage.add(data)
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