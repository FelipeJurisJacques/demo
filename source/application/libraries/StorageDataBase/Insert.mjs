import { Query } from "./Query.mjs"

export class Insert {

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
     * @param {object} data
     * @returns Promise<int|null>
     */
    async add(data = {}) {
        return new Promise((resolve, reject) => {
            if (Query.empty(data)) {
                reject(new Error('Data is empty'))
            } else if (!Query.serializable(data)) {
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