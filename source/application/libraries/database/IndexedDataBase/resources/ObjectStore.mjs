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

    get name() {
        this.#storage.name
    }

    /**
     * @throws {DOMException}
     * @param {string} key
     * @returns {IndexedDataBaseObjectStoreIndex}
     */
    index(key) {
        const index = this.#storage.index(key)
        return new IndexedDataBaseObjectStoreIndex(index)
    }

    /**
     * @param {object} data 
     * @returns {Promise<int>}
     */
    add(data) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.add(data)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to insert data'))
            }
            request.onsuccess = event => {
                resolve(event.target.result ? event.target.result : null)
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
     * @returns {Promise<Array>}
     */
    #cursor() {
        return new Promise((resolve, reject) => {
            const result = []
            const request = this.#storage.openCursor()
            request.onerror = () => {
                reject(new Error('Error to open cursor'))
            }
            request.onsuccess = () => {
                if (request.result) {
                    result.push(request.result.value)
                    request.result.continue()
                } else {
                    resolve(result)
                }
            }
        })
    }
}