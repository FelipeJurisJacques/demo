import { Subject } from "./Subject.mjs";
import { Observer } from "./Observer.mjs";
import { Asynchronous } from "./Asynchronous.mjs";
import { ServiceWorker } from "./ServiceWorker.mjs";
import { DataBase as Kernel } from "../kernels/DataBase.mjs";

class IndexedDataBaseConnection extends Observer {

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
     * @var {Array<IDBTransaction>}
     */
    #transactions

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
        super()
        this.#name = name
        this.#open = false
        this.#transactions = []
    }

    get name() {
        return this.#name
    }

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
     * @returns {Promise<IndexedDataBaseTransaction>}
     */
    async transaction(tables, write = true) {
        if (!this.open || !this.#database) {
            await this.open()
        }
        // while (this.#transaction) {
        //     await Asynchronous.wait(10)
        // }
        const transaction = this.#database.transaction(tables, write ? 'readwrite' : 'readonly')
        const instance = new IndexedDataBaseTransaction(transaction)
        this.#transactions.push(instance)
        // this.#transaction.subscribe(this)
        return instance
    }

    notify(data) { }
}

class IndexedDataBaseTransaction extends Subject {
    #transaction

    constructor(transaction) {
        super()
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

    /**
     * 
     * @param {string} table 
     * @returns {IndexedDataBaseObjectStore}
     */
    storage(table) {
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

    /**
     * @param {object} data 
     * @returns {Promise<int>}
     */
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

    /**
     * @param {number} id 
     * @returns {Promise<object>}
     */
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

export class DataBase {
    /**
     * @var {IndexedDataBaseConnection}
     */
    #connection

    constructor(name = 'database') {
        const connection = IndexedDataBaseConnections.from(name)
        if (!connection) {
            throw new Error('Database not found')
        }
        this.#connection = connection
    }

    // async #transaction(request) {
    //     request.database = this.#name
    //     const response = await ServiceWorker.message.request(request, 'database', 1000)
    //     return response.payload
    // }

    storage(tables, write = true) {
        return this.#connection.transaction(tables, write)
    }

    drop(table) {
        this.#connection.drop()
    }

    close() {
        this.#connection.close()
    }
}