import { Asynchronous } from "./Asynchronous.mjs";
import { ServiceWorker } from "./ServiceWorker.mjs";
import { DataBase as Kernel } from "../kernels/DataBase.mjs";

class IndexedDataBaseConnection {

    /**
     * @var {string}
     */
    #name

    /**
     * @var {boolean}
     */
    #open

    /**
     * @var {IDBDatabase}
     */
    #database

    /**
     * @var {Array<IndexedDataBaseTransaction>}
     */
    #transactions

    /**
     * @param {string} name
     */
    constructor(name) {
        this.#name = name
        this.#open = false
        this.#transactions = []
    }

    /**
     * @returns {string}
     */
    get name() {
        return this.#name
    }

    /**
     * @returns {boolean}
     */
    isOpen() {
        return this.#open && this.#database
    }

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

    /**
     * @returns {Array<IndexedDataBaseTransaction>}
     */
    get transactions() {
        return this.#transactions
    }

    /**
     * @returns {Promise<number>}
     */
    async version() {
        if (this.#database) {
            return this.#database.version
        }
        const databases = await this.indexedDB.databases()
        for (let database of databases) {
            if (this.#name === database.name) {
                return database.version
            }
        }
        reject(new Error('Database not found'))
    }

    /**
     * @returns {Promise}
     */
    open() {
        return new Promise(async (resolve, reject) => {
            let open = null
            // IDBOpenDBRequest
            const databases = await this.indexedDB.databases()
            for (let database of databases) {
                if (this.#name === database.name) {
                    open = this.indexedDB.open(this.#name)
                    break
                }
            }
            if (open) {
                open.onerror = () => {
                    reject(new Error('Fail to open'))
                }
                open.onsuccess = () => {
                    this.#database = open.result
                    this.#open = true
                    resolve()
                }
            } else {
                reject(new Error('Database not found'))
            }
        })
    }

    /**
     * @param {object} upgrade
     * @param {number} version
     * @returns {Promise}
     */
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
            open.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Fail to open'))
            }
            open.onsuccess = () => {
                this.#database = open.result
                this.#open = true
                resolve()
            }
        })
    }

    close() {
        if (this.#open && this.#database) {
            this.#database.close()
            this.#open = false
        }
    }

    drop() {
        return new Promise(async (resolve, reject) => {
            // IDBOpenDBRequest
            const open = this.indexedDB.deleteDatabase(this.name)
            open.onerror = event => {
                reject(event.target.error ? event.target.error : new Error(`Error to drop database ${this.name}`))
            }
            open.onsuccess = () => {
                resolve()
            }
        })
    }

    /**
     * @param {string|Array<string>} tables
     * @param {boolean} write
     * @returns {IndexedDataBaseTransaction}
     */
    transaction(tables, write = true) {
        if (!this.isOpen()) {
            throw new Error('The database connection is closing')
        }
        const transaction = this.#database.transaction(tables, write ? 'readwrite' : 'readonly')
        const instance = new IndexedDataBaseTransaction(this, transaction)
        this.#transactions.push(instance)
        return instance
    }
}

class IndexedDataBaseTransaction {

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {boolean}
     */
    #finalized

    /**
     * @var {IndexedDataBaseConnection}
     */
    #connection

    /**
     * @var {IDBTransaction}
     */
    #transaction

    /**
     * @param {IndexedDataBaseConnection} connection
     * @param {IDBTransaction} transaction 
     */
    constructor(connection, transaction) {
        this.#error = null
        this.#finalized = false
        this.#connection = connection
        this.#transaction = transaction
        this.#transaction.onerror = event => {
            this.#error = event.target.error ? event.target.error : new Error('Transaction error')
            this.#unset()
        }
        this.#transaction.onabort = event => {
            this.#error = event.target.error ? event.target.error : new Error('Transaction is aborted')
            this.#unset()
        }
        this.#transaction.oncomplete = event => {
            this.#unset()
        }
    }

    /**
     * @returns {Error|null}
     */
    get error() {
        return this.#transaction.error ? this.#transaction.error : this.#error
    }

    /**
     * @returns {boolean}
     */
    isFinalized() {
        return this.#finalized || this.error
    }

    commit() {
        if (!this.#finalized) {
            this.#transaction.commit()
        }
    }

    abort() {
        this.#transaction.abort()
    }

    /**
     * @param {string} table 
     * @returns {IndexedDataBaseObjectStore}
     */
    storage(table) {
        return new IndexedDataBaseObjectStore(this.#transaction.objectStore(table))
    }

    /**
     * @returns {Promise<Error|void}}
     */
    async complete() {
        while (!this.isFinalized()) {
            await Asynchronous.wait(10)
        }
        if (this.error) {
            throw this.error
        }
        return
    }

    #unset() {
        this.#finalized = true
        if (this.#connection.transactions.length > 0) {
            for (let i in this.#connection.transactions) {
                if (this.#connection.transactions[i] === this) {
                    this.#connection.transactions.splice(i, 1)
                }
            }
        }
        // if (this.error) {
        //     console.error(this.error)
        // }
    }
}

class IndexedDataBaseObjectStore {

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
                console.log(event)
                resolve(request.result)
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
            request.onsuccess = () => {
                resolve(request.result ? request.result : null)
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

    // cursor() {
    //     return new Promise((resolve, reject) => {
    //         const result = []
    //         const request = this.#storage.openCursor()
    //         request.onerror = () => {
    //             reject(new Error('Error to open cursor'))
    //         }
    //         request.onsuccess = () => {
    //             if (request.result) {
    //                 result.push(request.result.value)
    //                 request.result.continue()
    //             } else {
    //                 resolve(result)
    //             }
    //         }
    //     })
    // }

    /**
     * @param {object} data 
     * @param {number} id 
     * @returns {Promise<number>}
     */
    put(data, id = 0) {
        return new Promise((resolve, reject) => {
            const request = id > 0 ?  this.#storage.put(data, id) : this.#storage.put(data)
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
}

class IndexedDataBaseObjectStoreIndex {

    /**
     * @var {IDBIndex}
     */
    #index

    /**
     * @param {IDBIndex} index
     */
    constructor(index) {
        this.#index = index
    }

    /**
     * @param {string} key
     * @returns {Promise<object|null>}
     */
    get(key) {
        return new Promise((resolve, reject) => {
            const request = this.#index.get(key)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get'))
            }
            request.onsuccess = () => {
                resolve(request.result ? request.result : null)
            }
        })
    }

    /**
     * @returns {Promise<Array<Object>>}
     */
    all() {
        return new Promise((resolve, reject) => {
            const request = this.#index.getAll()
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get all'))
            }
            request.onsuccess = () => {
                resolve(request.result ? request.result : null)
            }
        })
    }

    // cursor(value) {
    //     return new Promise((resolve, reject) => {
    //         const result = []
    //         const request = this.#index.openCursor(value)
    //         request.onerror = () => {
    //             reject(new Error('Error to index cursor'))
    //         }
    //         request.onsuccess = () => {
    //             if (request.result) {
    //                 result.push(request.result.value)
    //                 request.result.continue()
    //             } else {
    //                 resolve(result)
    //             }
    //         }
    //     })
    // }

    /**
     * @param {any} value 
     * @returns {Promise<boolean>}
     */
    empty(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.openCursor(value)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to index cursor'))
            }
            request.onsuccess = () => {
                resolve(!request.result)
            }
        })
    }
}

export class IndexedDataBaseConnections {
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

let connection
for (let name in Kernel.versions) {
    connection = new IndexedDataBaseConnection(name)
    IndexedDataBaseConnections.push(connection)
    connection.install(Kernel.versions[name].upgrade, Kernel.versions[name].version)
}
// async #transaction(request) {
//     request.database = this.#name
//     const response = await ServiceWorker.message.request(request, 'database', 1000)
//     return response.payload
// }