import { ServiceWorker } from "./ServiceWorker.mjs";
import { DataBase as Kernel } from "../kernels/DataBase.mjs";
import { Asynchronous } from "./Asynchronous.mjs";

class IndexedDbRepository {
    constructor() {
        this.opened = false
        this.database = undefined
        this.transaction = undefined
    }

    get open() {
        return new Promise((resolve, reject) => {
            if (this.opened) {
                resolve(false)
            } else {
                if (indexedDB) {
                    this.database = indexedDB.open(this.name, this.version)
                    this.database.onerror = () => {
                        reject(false)
                    }
                    this.database.onupgradeneeded = (upgrade) => {
                        this.onUpgrade(upgrade)
                    }
                    this.database.onsuccess = () => {
                        this.opened = true
                        resolve(true)
                    }
                } else {
                    reject(false)
                }
            }
        })
    }

    close() {
        if (this.opened) {
            this.database.result.close()
            this.opened = false
            return true
        }
        return false
    }

    get dropDataBase() {
        return new Promise((resolve, reject) => {
            if (indexedDB) {
                this.database = indexedDB.deleteDatabase(this.name)
                this.database.onerror = () => {
                    reject(false)
                }
                this.database.onsuccess = () => {
                    this.opened = false
                    resolve(true)
                }
            }
            else {
                reject(false)
            }
        })
    }

    set setTransaction(tables) {
        if (this.opened) {
            if (typeof tables == 'object') {
                if (Array.isArray(tables)) {
                    this.transaction = this.database.result.transaction(tables, "readwrite")
                    return true
                }
            }
        }
        return false
    }

    get getTransactionComplete() {
        return new Promise((resolve, reject) => {
            if (this.transaction) {
                this.transaction.onerror = () => {
                    this.transaction = undefined
                    resolve(false)
                }
                this.transaction.oncomplete = () => {
                    this.transaction = undefined
                    resolve(true)
                }
                this.transaction.onabort = () => {
                    this.transaction = undefined
                    resolve(false)
                }
            }
            else {
                resolve(false)
            }
        })
    }

    objectStoreAdd(table, obj) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string' && typeof obj == 'object') {
                if (this.transaction) {
                    const request = this.transaction.objectStore(table).add(obj)
                    request.onerror = () => {
                        reject(null)
                    }
                    request.onsuccess = () => {
                        resolve(request.result)
                    }
                }
                else {
                    reject(null)
                }
            }
            else {
                reject(null)
            }
        })
    }

    objectStoreGet(table, id) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string' && !isNaN(id)) {
                if (this.transaction) {
                    const request = this.transaction.objectStore(table).get(id)
                    request.onerror = () => {
                        reject(null)
                    }
                    request.onsuccess = () => {
                        if (request.result) {
                            resolve(request.result)
                        }
                        reject(null)
                    }
                }
                else {
                    reject(null)
                }
            }
            else {
                reject(null)
            }
        })
    }

    objectStoreCursor(table) {
        return new Promise((resolve, reject) => {
            let r = new Array()
            if (typeof table == 'string') {
                if (this.transaction) {
                    const request = this.transaction.objectStore(table).openCursor()
                    request.onerror = () => {
                        reject(r)
                    }
                    request.onsuccess = () => {
                        if (request.result) {
                            r.push(request.result.value)
                            request.result.continue()
                        }
                        else {
                            if (r.length > 0) {
                                resolve(r)
                            }
                            else {
                                resolve(r)
                            }
                        }
                    }
                }
                else {
                    reject(r)
                }
            }
            else {
                reject(r)
            }
        })
    }

    objectStoreIndex(table, column, value) {
        return new Promise((resolve, reject) => {
            let r = new Array()
            if (typeof table == 'string' && typeof column == 'string') {
                if (this.transaction) {
                    let request
                    try {
                        request = this.transaction.objectStore(table).index(column).openCursor(value)
                    }
                    catch {
                        reject(r)
                    }
                    request.onerror = () => {
                        reject(r)
                    }
                    request.onsuccess = () => {
                        if (request.result) {
                            r.push(request.result.value)
                            request.result.continue()
                        }
                        else {
                            if (r.length > 0) {
                                resolve(r)
                            }
                            else {
                                resolve(r)
                            }
                        }
                    }
                }
                else {
                    reject(r)
                }
            }
            else {
                reject(r)
            }
        })
    }

    objectStorePut(table, obj) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string' && typeof obj == 'object') {
                if (!isNaN(obj.id)) {
                    if (this.transaction) {
                        const request = this.transaction.objectStore(table).put(obj)
                        request.onerror = () => {
                            reject(false)
                        }
                        request.onsuccess = () => {
                            resolve(true)
                        }
                    }
                    else {
                        reject(false)
                    }
                }
                else {
                    reject(false)
                }
            }
            else {
                reject(false)
            }
        })
    }

    objectStoreDelete(table, id) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string' && !isNaN(id)) {
                if (this.transaction) {
                    const request = this.transaction.objectStore(table).delete(id)
                    request.onerror = () => {
                        reject(false)
                    }
                    request.onsuccess = () => {
                        resolve(true)
                    }
                }
                else {
                    reject(false)
                }
            }
            else {
                reject(false)
            }
        })
    }

    objectStoreEmpty(table) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string') {
                if (this.transaction) {
                    let request = this.transaction.objectStore(table).openCursor()
                    request.onerror = () => {
                        reject(null)
                    }
                    request.onsuccess = () => {
                        if (request.result) {
                            resolve(false)
                        }
                        else {
                            resolve(true)
                        }
                    }
                }
                else {
                    reject(null)
                }
            }
            else {
                reject(null)
            }
        })
    }

    objectStoreIndexEmpty(table, column, parentId) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string' && typeof column == 'string' && !isNaN(parentId)) {
                if (this.transaction) {
                    const request = this.transaction.objectStore(table).index(column).openCursor(parentId)
                    request.onerror = () => {
                        reject(null)
                    }
                    request.onsuccess = () => {
                        if (request.result) {
                            resolve(false)
                        }
                        else {
                            resolve(true)
                        }
                    }
                }
                else {
                    reject(null)
                }
            }
            else {
                reject(null)
            }
        })
    }

    objectStoreHas(table, id) {
        return new Promise((resolve, reject) => {
            if (typeof table == 'string' && !isNaN(id)) {
                if (this.transaction) {
                    const request = this.transaction.objectStore(table).get(id)
                    request.onerror = () => {
                        reject(null)
                    }
                    request.onsuccess = () => {
                        if (request.result) {
                            resolve(true)
                        }
                        resolve(false)
                    }
                }
                else {
                    reject(null)
                }
            }
            else {
                reject(null)
            }
        })
    }
}

class IndexedDataBaseConnection {
    #name

    /**
     * @var IDBDatabase
     */
    #database

    #transaction

    /**
     * @method static
     * @returns {IDBFactory}
     */
    get indexedDB() {
        if (indexedDB) {
            return indexedDB
        } else {
            reject(new Error('Unsupported IndexedDB'))
        }
    }

    constructor(name) {
        this.#name = name
    }

    static get name() {
        return this.#name
    }

    open() {
        return new Promise((resolve, reject) => {
            // IDBOpenDBRequest
            const open = this.indexedDB.open(this.#name)
            open.onerror = () => {
                reject(new Error('Fail to open'))
            }
            open.onsuccess = () => {
                this.#database = open.result
                resolve()
            }
        })
    }

    install(upgrade, version) {
        return new Promise((resolve, reject) => {
            // IDBOpenDBRequest
            const open = this.indexedDB.open(this.#name, version)
            open.onupgradeneeded = event => {
                const database = event.target.result
                if (upgrade.stores) {
                    let storage
                    for (let store of upgrade.stores) {
                        if (database.objectStoreNames.contains(store.name)) {
                            continue
                        }
                        if (store.options) {
                            storage = database.createObjectStore(store.name, store.options)
                        } else {
                            storage = database.createObjectStore(store.name)
                        }
                        if (store.indexes) {
                            for (let index of store.indexes) {
                                if (index.options) {
                                    storage.createIndex(index.name, index.name, index.options)
                                } else {
                                    storage.createIndex(index.name, index.name)
                                }
                            }
                        }
                    }
                }
            }
            open.onerror = () => {
                reject(new Error('Fail to open'))
            }
            open.onsuccess = () => {
                this.#database = open.result
                resolve()
            }
        })
    }

    async close() {
        if (this.#database) {
            while (this.#transaction) {
                await Asynchronous.wait(10)
            }
            this.#database.close()
            this.#database = null
        }
    }

    drop() {
        return new Promise(async (resolve, reject) => {
            while (this.#transaction) {
                await Asynchronous.wait(10)
            }
            // IDBOpenDBRequest
            const open = this.indexedDB.deleteDatabase(this.name)
            open.onerror = () => {
                reject(new Error(`Error to drop database ${this.name}`))
            }
            open.onsuccess = () => {
                resolve()
            }
        })
    }

    /**
     * @param {Array} tables
     * @param {boolean} write
     * @returns {Promise}
     */
    async transaction(tables, write = true) {
        if (!this.#database) {
            await this.open()
        }
        while (this.#transaction) {
            await Asynchronous.wait(10)
        }
        const transaction = this.#database.transaction(tables, write ? 'readwrite' : 'readonly')
        this.#transaction = new IndexedDataBaseTransaction(transaction)
        return this.#transaction
    }

}

class IndexedDataBaseTransaction {
    #transaction

    constructor(transaction) {
        this.#transaction = transaction
    }

    objectStore(table) {
        return new IndexedDataBaseObjectStore(this.#transaction.objectStore(table))
    }

    complete() {
        return new Promise((resolve, reject) => {
            if (this.#transaction) {
                this.transaction.onerror = () => {
                    this.transaction = null
                    reject(new Error('Transaction error'))
                }
                this.transaction.onabort = () => {
                    this.transaction = null
                    reject(new Error('Transaction is aborted'))
                }
                this.transaction.oncomplete = () => {
                    this.transaction = null
                    resolve()
                }
            } else {
                resolve()
            }
        })
    }
}

class IndexedDataBaseObjectStore {

    /**
     * @var IDBObjectStore
     */
    #storage

    constructor(storage) {
        this.#storage = storage
    }

    index(key) {
        return new IndexedDataBaseObjectStoreIndex(this.#storage.index(key))
    }

    add(data) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.add(data)
            request.onerror = () => {
                reject(new Error('Error to insert data'))
            }
            request.onsuccess = () => {
                resolve(request.result)
            }
        })
    }

    get(id) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.get(id)
            request.onerror = () => {
                reject(new Error('Error to get'))
            }
            request.onsuccess = () => {
                resolve(request.result ? request.result : null)
            }
        })
    }

    cursor() {
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

    put(data) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.put(data)
            request.onerror = () => {
                reject(new Error('Errot to put'))
            }
            request.onsuccess = () => {
                resolve()
            }
        })
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.delete(id)
            request.onerror = () => {
                reject(new Error('Error to delete'))
            }
            request.onsuccess = () => {
                resolve()
            }
        })
    }

    empty() {
        return new Promise((resolve, reject) => {
            const request = this.#storage.openCursor()
            request.onerror = () => {
                reject(new Error('Error to open cursor'))
            }
            request.onsuccess = () => {
                resolve(!request.result)
            }
        })
    }

    has(id) {
        return new Promise((resolve, reject) => {
            const request = this.#storage.get(id)
            request.onerror = () => {
                reject(new Error('Error to get'))
            }
            request.onsuccess = () => {
                resolve(request.result ? true : false)
            }
        })
    }
}

class IndexedDataBaseObjectStoreIndex {

    /**
     * @var IDBIndex
     */
    #index

    constructor(index) {
        this.#index = index
    }

    cursor(value) {
        return new Promise((resolve, reject) => {
            const result = []
            const request = this.#index.openCursor(value)
            request.onerror = () => {
                reject(new Error('Error to index cursor'))
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

    empty(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.openCursor(value)
            request.onerror = () => {
                reject(new Error('Error to index cursor'))
            }
            request.onsuccess = () => {
                resolve(!request.result)
            }
        })
    }
}

class IndexedDataBaseConnections {
    static #connections

    /**
     * @param {IndexedDataBaseConnection} connection
     * @returns {IndexedDataBaseConnection}
     */
    static push(connection) {
        if (!this.#connections) {
            this.#connections = []
        }
        this.#connections.push(connection)
        return connection
    }

    /**
     * @param {string} name
     * @returns {IndexedDataBaseConnection|null}
     */
    static from(name) {
        if (this.#connections) {
            for (let connection of this.#connections) {
                if (connection.name === name) {
                    return connection
                }
            }
        }
        return null
    }
}

class IndexedDataBase {
    static async #connection(name, version, upgrade) {
        if (!data.database) {
            throw new Error('Database name is required')
        }
        let connection = IndexedDataBaseConnections.from(data.database)
        if (!connection) {
            if (!data.upgrade || !data.version) {
                throw new Error('Version and upgrade is required')
            }
            connection = new IndexedDataBase(data.database)
            IndexedDataBaseConnections.push(connection)
        }
        if (data.upgrade && data.version) {
            await connection.install(data.upgrade, data.version)
        } else {
            await connection.open()
        }
        return {}
    }
}

// class IndexedDbTablesRepository {
//     constructor() {
//         this.name = 'ASFAR'
//         this.version = 1
//     }

//     onUpgrade(upgrade) {
//         let db = upgrade.target.result
//         let objectStore = undefined

//         if (!db.objectStoreNames.contains('cliente')) {
//             objectStore = db.createObjectStore('cliente', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//             objectStore.createIndex("nome", "nome", { unique: false })
//         }

//         if (!db.objectStoreNames.contains('talhao')) {
//             objectStore = db.createObjectStore('talhao', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//             objectStore.createIndex("clienteId", "clienteId", { unique: false })
//         }

//         if (!db.objectStoreNames.contains('analiseSolo')) {
//             objectStore = db.createObjectStore('analiseSolo', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//             objectStore.createIndex("talhaoId", "talhaoId", { unique: false })
//         }

//         if (!db.objectStoreNames.contains('laudoSolo')) {
//             objectStore = db.createObjectStore('laudoSolo', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//             objectStore.createIndex("analiseSoloId", "analiseSoloId", { unique: false })
//         }

//         if (!db.objectStoreNames.contains('configuracao')) {
//             objectStore = db.createObjectStore('configuracao', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//         }

//         if (!db.objectStoreNames.contains('acidezSolo')) {
//             objectStore = db.createObjectStore('acidezSolo', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//             objectStore.createIndex("configuracaoId", "configuracaoId", { unique: false })
//         }

//         if (!db.objectStoreNames.contains('fertilidadeSolo')) {
//             objectStore = db.createObjectStore('fertilidadeSolo', {
//                 keyPath: "id",
//                 autoIncrement: true
//             })
//             objectStore.createIndex("configuracaoId", "configuracaoId", { unique: false })
//         }
//     }
// }

export class DataBase {
    #name

    constructor(name = 'database') {
        this.#name = name
    }

    async #transaction(request) {
        request.database = this.#name
        const response = await ServiceWorker.message.request(request, 'database', 1000)
        return response.payload
    }

    async #install() {
        for (let name in Kernel.versions) {
            if (name === this.#name) {
                const migrate = Kernel.versions[name]
                const request = {
                    upgrade: migrate.upgrade,
                    version: migrate.version,
                }
                await this.#transaction(request)
                return
            }
        }
        throw new Error(`Database ${this.#name} does not exist`)
    }

    async insert(data) {
        this.#install()
    }
}