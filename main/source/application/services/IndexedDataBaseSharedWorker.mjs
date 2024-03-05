// class Connection {
//     static #uuid = 1

//     #id
//     #name
//     #statement
//     #transactions

//     constructor(name) {
//         this.#id = this.constructor.#uuid++
//         this.#name = name
//         this.#transactions = []
//     }

//     /**
//      * @returns {string}
//      */
//     get name() {
//         return this.#name
//     }

//     /**
//      * @returns {boolean}
//      */
//     get opened() {
//         return this.#statement ? true : false
//     }

//     /**
//      * @returns {IDBDatabase}
//      */
//     get statement() {
//         return this.#statement
//     }

//     open(version, upgrade) {
//         return new Promise((resolve, reject) => {
//             const db = indexedDB
//             if (!db) {
//                 reject(new Error('Unsupported IndexedDB'))
//             } else {
//                 const open = version ? db.open(this.#name, version) : db.open(this.#name)
//                 if (upgrade) {
//                     open.onupgradeneeded = upgrade
//                 }
//                 open.onerror = event => {
//                     reject(event.target.error)
//                 }
//                 open.onsuccess = event => {
//                     this.#statement = event.target.result
//                     resolve(this)
//                 }
//             }
//         })
//     }

//     toJSON() {
//         const names = []
//         for (let name of this.#statement.objectStoreNames) {
//             names.push(name)
//         }
//         return {
//             id: this.#id,
//             name: this.#name,
//             opened: this.#statement ? true : false,
//             storages: names,
//         }
//     }
// }

// class Transaction {
//     static #uuid = 1

//     #id
//     #trace
//     #statement

//     constructor(parameters) {
//         this.#id = this.constructor.#uuid++
//         this.#trace = parameters.trace
//         this.#statement = parameters.connection.statement.transaction(
//             parameters.tables,
//             parameters.mode
//         )
//     }

//     /**
//      * @returns {IDBTransaction}
//      */
//     get statement() {
//         return this.#statement
//     }

//     toJSON() {
//         const names = []
//         for (let name of this.#statement.objectStoreNames) {
//             names.push(name)
//         }
//         return {
//             id: this.#id,
//             mode: this.#statement.mode,
//             storages: names,
//         }
//     }
// }

// class IndexedDataBaseSharedWorker {
//     static #uuid = 1
//     static #indexes = {}
//     static #requests = {}
//     static #storages = {}
//     static #connections = []
//     static #transactions = {}

//     static get uuid() {
//         return this.#uuid++
//     }

//     static execute(message) {
//         return new Promise((resolve, reject) => {
//             const data = message.data
//             if (data.open) {
//                 const name = data.open.database
//                 const version = data.open.version
//                 const upgrade = data.open.upgrade
//                 for (let connection of this.#connections) {
//                     if (name === connection.name) {
//                         resolve(connection.toJSON())
//                         return
//                     }
//                 }
//                 (new Connection(name)).open(version, upgrade).then(connection => {
//                     this.#connections.push(connection)
//                     resolve(connection.toJSON())
//                 }).catch(error => {
//                     reject(error)
//                 })
//             }
//             // if (data.transaction) {
//             //     const transaction = this.#connection.transaction(
//             //         data.transaction.tables,
//             //         data.transaction.mode
//             //     )
//             //     if (!transaction instanceof IDBTransaction) {
//             //         reject(new Error('undefined type'))
//             //         return
//             //     }
//             //     const id = this.uuid
//             //     this.#transactions[id] = transaction
//             //     const names = []
//             //     for (let name of transaction.objectStoreNames) {
//             //         names.push(name)
//             //     }
//             //     resolve({
//             //         transaction: {
//             //             id: id,
//             //             mode: transaction.mode,
//             //             trace: data.transaction.trace,
//             //             storages: names,
//             //         },
//             //     })
//             // }
//         })
//         // const result = {
//         //     index: null,
//         //     request: null,
//         //     storage: null,
//         //     storage: null,
//         //     connection: null,
//         //     transaction: null,
//         // }
//         // let index = null
//         // let request = null
//         // let storage = null
//         // let connection = null
//         // let transaction = null
//         // connection = await new Promise((resolve, reject) => {
//         //     const db = indexedDB
//         //     const name = parameters.database
//         //     const version = parameters.version
//         //     const upgrade = parameters.upgrade
//         //     if (!db) {
//         //         reject(new Error('Unsupported IndexedDB'))
//         //     } else {
//         //         const open = version ? db.open(name, version) : db.open(name)
//         //         open.onerror = event => {
//         //             reject(event.target.error)
//         //         }
//         //         open.onsuccess = () => {
//         //             resolve(open.result)
//         //         }
//         //         if (upgrade) {
//         //             open.onupgradeneeded = upgrade
//         //         }
//         //     }
//         // })
//         // if (!connection instanceof IDBDatabase) {
//         //     return result
//         // }
//         // result.connection = this.#uuid++
//         // this.#connections[result.connection] = connection
//         // transaction = connection.transaction(parameters.tables, parameters.mode)
//         // if (!transaction instanceof IDBTransaction) {
//         //     return result
//         // }
//         // result.transaction = this.#uuid++
//         // this.#transactions[result.transaction] = connection
//         // storage = transaction.objectStore(parameters.table)
//         // if (!storage instanceof IDBObjectStore) {
//         //     return result
//         // }
//         // result.storage = this.#uuid++
//         // this.#storages[result.storage] = storage
//         // if (parameters.index) {
//         //     index = storage.index(parameters.index)
//         //     if (!index instanceof IDBIndex) {
//         //         return result
//         //     }
//         //     result.index = this.#uuid++
//         //     this.#indexes[result.index] = index
//         // } else {
//         //     if (parameters.cursor) {
//         //         request = storage.openCursor(
//         //             parameters.range ? parameters.range : undefined,
//         //             parameters.direction ? parameters.direction : undefined
//         //         )
//         //         if (!request instanceof IDBRequest) {
//         //             return result
//         //         }
//         //         result.request = this.#uuid++
//         //         this.#requests[result.request] = request
//         //         result.request = request
//         //     }
//         // }
//         // return result
//     }
// }

self.onconnect = event => {
    for (let port of event.ports) {
        port.onmessage = async event => {
            // const id = IndexedDataBaseSharedWorker.uuid
            port.postMessage({
                id: 1,
                manager: manager,
            })
            // const data = event.data.data
            // const manager = event.data.manager
            // try {
            //     // const response = await IndexedDataBaseSharedWorker.execute({
            //     //     id: id,
            //     //     data: data,
            //     // })
            //     // port.postMessage({
            //     //     id: id,
            //     //     data: response,
            //     //     manager: manager,
            //     // })
            // } catch (error) {
            //     port.postMessage({
            //         id: id,
            //         data: error,
            //         manager: manager,
            //     })
            // }
        }
    }
}
