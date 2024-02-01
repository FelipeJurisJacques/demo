class IndexedDataBase {
    static #uuid = 1
    static #indexes = {}
    static #requests = {}
    static #storages = {}
    static #connections = {}
    static #transactions = {}

    /**
     * @param {object} parameters 
     */
    static async execute(parameters) {
        const result = {
            index: null,
            request: null,
            storage: null,
            storage: null,
            connection: null,
            transaction: null,
        }
        let index = null
        let request = null
        let storage = null
        let connection = null
        let transaction = null
        connection = await new Promise((resolve, reject) => {
            const db = indexedDB
            const name = parameters.database
            const version = parameters.version
            const upgrade = parameters.upgrade
            if (!db) {
                reject(new Error('Unsupported IndexedDB'))
            } else {
                const open = version ? db.open(name, version) : db.open(name)
                open.onerror = event => {
                    reject(event.target.error)
                }
                open.onsuccess = () => {
                    resolve(open.result)
                }
                if (upgrade) {
                    open.onupgradeneeded = upgrade
                }
            }
        })
        if (!connection instanceof IDBDatabase) {
            return result
        }
        result.connection = this.#uuid++
        this.#connections[result.connection] = connection
        transaction = connection.transaction(parameters.tables, parameters.mode)
        if (!transaction instanceof IDBTransaction) {
            return result
        }
        result.transaction = this.#uuid++
        this.#transactions[result.transaction] = connection
        storage = transaction.objectStore(parameters.table)
        if (!storage instanceof IDBObjectStore) {
            return result
        }
        result.storage = this.#uuid++
        this.#storages[result.storage] = storage
        if (parameters.index) {
            index = storage.index(parameters.index)
            if (!index instanceof IDBIndex) {
                return result
            }
            result.index = this.#uuid++
            this.#indexes[result.index] = index
        } else {
            if (parameters.cursor) {
                request = storage.openCursor(
                    parameters.range ? parameters.range : undefined,
                    parameters.direction ? parameters.direction : undefined
                )
                if (!request instanceof IDBRequest) {
                    return result
                }
                result.request = this.#uuid++
                this.#requests[result.request] = request
                result.request = request
            }
        }
        return result
    }
}