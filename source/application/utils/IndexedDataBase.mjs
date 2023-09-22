import { Asynchronous } from "./Asynchronous.mjs";
// import { ServiceWorker } from "./ServiceWorker.mjs";
import { DataBase as Kernel } from "../kernels/DataBase.mjs";

class IndexedDataBaseConnection {

    /**
     * @var {string}
     */
    #name

    /**
     * @var {Error|null}
     */
    #error

    /**
     * @var {boolean}
     */
    #state

    /**
     * @var {IDBDatabase}
     */
    #database

    /**
     * @var {number}
     */
    #interaction

    /**
     * @var {Array<IndexedDataBaseTransaction>}
     */
    #transactions

    /**
     * @param {string} name
     */
    constructor(name) {
        this.#name = name
        this.#state = false
        this.#interaction = 0
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
    get opened() {
        return this.#state && this.#database
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
            if (this.#state) {
                while (this.#state && !this.#database) {
                    await Asynchronous.wait(10)
                }
                if (this.#database) {
                    resolve()
                } else {
                    reject(this.#error ? this.#error : reject(new Error('Fail to open')))
                }
            } else {
                this.#error = null
                this.#state = true
                this.#transactions = []
                // IDBOpenDBRequest
                let open = null
                const databases = await this.indexedDB.databases()
                for (let database of databases) {
                    if (this.#name === database.name) {
                        open = this.indexedDB.open(this.#name)
                        break
                    }
                }
                if (open) {
                    open.onerror = event => {
                        this.#error = event.target.error ? event.target.error : new Error('Fail to open')
                        this.#state = false
                        console.error(this.#error)
                        reject(this.#error)
                    }
                    open.onsuccess = () => {
                        this.#database = open.result
                        this.#autoClose()
                        console.log(`Database ${this.name} opened`)
                        resolve()
                    }
                } else {
                    this.#error = new Error('Database not found')
                    this.#state = false
                    reject(this.#error)
                }
            }
        })
    }

    /**
     * @param {object} upgrade
     * @param {number} version
     * @returns {Promise}
     */
    install(upgrade, version) {
        return new Promise(async (resolve, reject) => {
            if (this.#state) {
                while (this.#state && !this.#database) {
                    await Asynchronous.wait(10)
                }
                if (this.#database) {
                    resolve()
                } else {
                    reject(this.#error ? this.#error : reject(new Error('Fail to open')))
                }
            } else {
                this.#error = null
                // IDBOpenDBRequest
                const open = this.indexedDB.open(this.#name, version)
                this.#state = true
                this.#transactions = []
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
                    this.#state = false
                    this.#error = event.target.error ? event.target.error : new Error('Fail to open')
                    console.error(this.#error)
                    reject(this.#error)
                }
                open.onsuccess = event => {
                    this.#database = open.result
                    this.#autoClose()
                    console.log(`Database ${this.name} opened`)
                    resolve()
                }
            }
        })
    }

    close() {
        if (this.#database) {
            this.#database.close()
            this.#state = false
            this.#transactions = []
            console.log(`Database ${this.name} closed`)
        }
    }

    drop() {
        return new Promise(async (resolve, reject) => {
            // IDBOpenDBRequest
            const open = this.indexedDB.deleteDatabase(this.name)
            this.#state = true
            open.onerror = event => {
                this.#state = false
                reject(event.target.error ? event.target.error : new Error(`Error to drop database ${this.name}`))
            }
            open.onsuccess = event => {
                this.#state = false
                resolve()
            }
            this.#transactions = []
        })
    }

    /**
     * @param {string|Array<string>} names
     * @param {boolean} write
     * @returns {Promise<IndexedDataBaseTransaction>}
     */
    async transaction(names, write = true) {
        if (typeof names === 'object' && names instanceof Array && names.length > 1) {
            names = names.sort()
        }
        if (!this.opened) {
            await this.open()
        }
        // if (!this.opened) {
        //     throw new Error('The database connection is closing')
        // }
        // for (let transaction of this.#transactions) {
        //     if (
        //         !transaction.done
        //         && (!write || transaction.mode === 'readwrite')
        //     ) {
        //         let list = transaction.names
        //         if (names.length === list.length) {
        //             let equal = true
        //             for (let i = 0; i < names.length; i++) {
        //                 if (names[i] !== list[i]) {
        //                     equal = false
        //                     break
        //                 }
        //             }
        //             if (equal) {
        //                 return transaction
        //             }
        //         }
        //     }
        // }
        const object = this.#database.transaction(names, write ? 'readwrite' : 'readonly')
        const instance = new IndexedDataBaseTransaction(object)
        this.#transactions.push(instance)
        this.#autoClose()
        return instance
    }

    #autoClose() {
        if (this.opened) {
            this.interaction++
            const interaction = this.#interaction
            setTimeout(() => {
                if (this.opened) {
                    if (interaction === this.#interaction) {
                        let done = 0
                        if (this.transactions.length > 0) {
                            for (let transaction of this.transactions) {
                                if (transaction.done) {
                                    done++
                                }
                            }
                        }
                        if (done === this.transactions.length) {
                            this.close()
                        }
                    }
                }
            }, 1000)
        }
    }
}

class IndexedDataBaseTransaction {

    /**
     * @var {boolean}
     */
    #done

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {Array<IndexedDataBaseObjectStore>}
     */
    #storages

    /**
     * @var {IDBTransaction}
     */
    #transaction

    /**
     * @param {IDBTransaction} transaction 
     */
    constructor(transaction) {
        this.#done = false
        this.#error = null
        this.#storages = []
        this.#transaction = transaction
        this.#transaction.onerror = event => {
            this.#error = event.target.error ? event.target.error : new Error('Transaction error')
            this.#done = true
            console.error(this.error)
        }
        this.#transaction.onabort = event => {
            this.#error = event.target.error ? event.target.error : new Error('Transaction is aborted')
            this.#done = true
            console.error(this.error)
        }
        this.#transaction.oncomplete = event => {
            if (event.target.error) {
                this.#error = event.target.error
            }
            this.#done = true
        }
    }

    /**
     * @returns {boolean}
     */
    get done() {
        return this.#done
    }

    /**
     * @returns {Error|null}
     */
    get error() {
        return this.#transaction.error ? this.#transaction.error : this.#error
    }

    /**
     * @returns {string}
     */
    get mode() {
        this.#transaction.mode
    }

    /**
     * @returns {Array<string>}
     */
    get names() {
        const list = []
        for (let name of this.#transaction.objectStoreNames) {
            list.push(name)
        }
        return list.length > 1 ? list.sort() : list
    }

    commit() {
        if (!this.#done) {
            this.#transaction.commit()
        }
    }

    abort() {
        this.#transaction.abort()
    }

    /**
     * @param {string} name 
     * @returns {IndexedDataBaseObjectStore}
     */
    storage(name) {
        if (this.#storages.length > 0) {
            for (let storage of this.#storages) {
                if (storage.name === name) {
                    return storage
                }
            }
        }
        const object = this.#transaction.objectStore(name)
        const instance = new IndexedDataBaseObjectStore(object)
        this.#storages.push(instance)
        return instance
    }

    /**
     * @returns {Promise<Error|void}}
     */
    async complete() {
        while (!this.done) {
            await Asynchronous.wait(10)
        }
        if (this.error) {
            throw this.error
        }
        return
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
     * @param {any} value
     * @returns {Promise<object|null>}
     */
    get(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.get(value)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get'))
            }
            request.onsuccess = event => {
                resolve(event.target.result)
            }
        })
    }

    /**
     * @param {any} value
     * @returns {Promise<Array<Object>>}
     */
    all(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.getAll(value)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get all'))
            }
            request.onsuccess = event => {
                resolve(event.target.result)
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

export class IndexedDataBase extends IndexedDataBaseConnection {
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
    connection = new IndexedDataBase(name)
    IndexedDataBase.push(connection)
    connection.install(Kernel.versions[name].upgrade, Kernel.versions[name].version)
}
// async #transaction(request) {
//     request.database = this.#name
//     const response = await ServiceWorker.message.request(request, 'database', 1000)
//     return response.payload
// }