// install: é disparado quando o service worker é instalado pela primeira vez ou quando o arquivo do service worker é alterado. Esse evento é usado para armazenar em cache os recursos estáticos da aplicação, como HTML, CSS, JavaScript e imagens.
// activate: é disparado quando o service worker é ativado, ou seja, quando ele passa a controlar as páginas da aplicação. Esse evento é usado para limpar os caches antigos ou fazer outras tarefas de inicialização.
// fetch: é disparado quando o service worker intercepta uma solicitação de rede feita pela aplicação. Esse evento é usado para implementar estratégias de cache dinâmico, como cache first, network first, stale while revalidate, etc.
// push: é disparado quando o service worker recebe uma mensagem push do servidor. Esse evento é usado para mostrar uma notificação ao usuário ou atualizar os dados da aplicação em segundo plano.
// sync: é disparado quando o service worker recebe um sinal de sincronização periódica ou de uma tarefa em segundo plano. Esse evento é usado para enviar ou receber dados do servidor quando há conectividade disponível.
// message: é disparado quando o service worker recebe uma mensagem simples de outra parte da aplicação, como a janela principal ou outro service worker. Esse evento é usado para comunicar dados entre o service worker e a aplicação.
// const broadcast = new BroadcastChannel('notifications')
// broadcast.postMessage(JSON.stringify(event))
// broadcast.close()

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

class IndexedDataBase {
    #name
    #database

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
            this.#database = this.indexedDB.open(this.#name)
            this.#database.onerror = () => {
                reject(new Error('Fail to open'))
            }
            this.#database.onsuccess = () => {
                resolve()
            }
        })
    }

    install(upgrade, version) {
        return new Promise((resolve, reject) => {
            this.#database = this.indexedDB.open(this.#name, version)
            this.#database.onupgradeneeded = event => {
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
            this.#database.onerror = () => {
                reject(new Error('Fail to open'))
            }
            this.#database.onsuccess = () => {
                resolve()
            }
        })
    }
}

class IndexedDataBaseConnections {
    static #connections

    /**
     * @param {IndexedDataBase} connection
     * @requires {IndexedDataBase}
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
     * @returns {IndexedDataBase|null}
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

class IndexedDataBaseController {
    static async handler(data) {
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

self.addEventListener('activate', event => {
    // const broadcast = new BroadcastChannel('notifications')
    // broadcast.postMessage({title:'ativado o sw'})
    // broadcast.close()
})

self.addEventListener('message', async event => {
    // ExtendableMessageEvent
    const uuid = event.data.uuid ? event.data.uuid : 0
    const manager = event.data.manager ? event.data.manager : 'global'
    const payload = event.data.payload ? event.data.payload : {}
    const client = await clients.get(event.source.id)
    if (client) {
        const response = {
            uuid: uuid,
            manager: manager,
            payload: null,
        }
        try {
            switch (manager) {
                case 'database':
                    response.payload = await IndexedDataBaseController.handler(payload)
                    break
                default:
                    break
            }
        } catch (error) {
            response.payload = {
                error: `${error.message} in ${error.stack}`,
            }
        }
        client.postMessage(response)
    }
})