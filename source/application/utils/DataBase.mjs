import { Asynchronous } from "./Asynchronous.mjs";
import { ServiceWorker } from "./ServiceWorker.mjs";
import { Subject, Observer } from "./Observer.mjs";
import { DataBase as Kernel } from "../kernels/DataBase.mjs";

class IndexedDataBaseConnection extends Observer {

    /**
     * @var {string}
     */
    #name

    /**
     * @var {IDBDatabase}
     */
    #database

    /**
     * @var {IDBTransaction}
     */
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

    notify(data) {
        this.#transaction = null
    }
}

class IndexedDataBaseTransaction extends Subject {
    #transaction

    constructor(transaction) {
        this.#transaction = transaction
        this.#transaction.onerror = () => {
            this.notify(new Error('Transaction error'))
        }
        this.#transaction.onabort = () => {
            this.notify(new Error('Transaction is aborted'))
        }
        this.#transaction.oncomplete = () => {
            this.notify()
        }
    }

    objectStore(table) {
        return new IndexedDataBaseObjectStore(this.#transaction.objectStore(table))
    }

    complete() {
        const observer = new Asynchronous();
        this.subscribe(observer)
        return observer.observe(1000)
    }
}

class IndexedDataBaseObjectStore {

    /**
     * @var {IDBObjectStore}
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
     * @var {IDBIndex}
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