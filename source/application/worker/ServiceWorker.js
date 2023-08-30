// install: é disparado quando o service worker é instalado pela primeira vez ou quando o arquivo do service worker é alterado. Esse evento é usado para armazenar em cache os recursos estáticos da aplicação, como HTML, CSS, JavaScript e imagens.
// activate: é disparado quando o service worker é ativado, ou seja, quando ele passa a controlar as páginas da aplicação. Esse evento é usado para limpar os caches antigos ou fazer outras tarefas de inicialização.
// fetch: é disparado quando o service worker intercepta uma solicitação de rede feita pela aplicação. Esse evento é usado para implementar estratégias de cache dinâmico, como cache first, network first, stale while revalidate, etc.
// push: é disparado quando o service worker recebe uma mensagem push do servidor. Esse evento é usado para mostrar uma notificação ao usuário ou atualizar os dados da aplicação em segundo plano.
// sync: é disparado quando o service worker recebe um sinal de sincronização periódica ou de uma tarefa em segundo plano. Esse evento é usado para enviar ou receber dados do servidor quando há conectividade disponível.
// message: é disparado quando o service worker recebe uma mensagem simples de outra parte da aplicação, como a janela principal ou outro service worker. Esse evento é usado para comunicar dados entre o service worker e a aplicação.
// const broadcast = new BroadcastChannel('notifications')
// broadcast.postMessage(JSON.stringify(event))
// broadcast.close()

class IndexedDbTablesRepository {
    constructor() {
        this.name = 'ASFAR'
        this.version = 1
    }

    onUpgrade(upgrade) {
        let db = upgrade.target.result
        let objectStore = undefined

        if (!db.objectStoreNames.contains('cliente')) {
            objectStore = db.createObjectStore('cliente', {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("nome", "nome", { unique: false })
        }

        if (!db.objectStoreNames.contains('talhao')) {
            objectStore = db.createObjectStore('talhao', {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("clienteId", "clienteId", { unique: false })
        }

        if (!db.objectStoreNames.contains('analiseSolo')) {
            objectStore = db.createObjectStore('analiseSolo', {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("talhaoId", "talhaoId", { unique: false })
        }

        if (!db.objectStoreNames.contains('laudoSolo')) {
            objectStore = db.createObjectStore('laudoSolo', {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("analiseSoloId", "analiseSoloId", { unique: false })
        }

        if (!db.objectStoreNames.contains('configuracao')) {
            objectStore = db.createObjectStore('configuracao', {
                keyPath: "id",
                autoIncrement: true
            })
        }

        if (!db.objectStoreNames.contains('acidezSolo')) {
            objectStore = db.createObjectStore('acidezSolo', {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("configuracaoId", "configuracaoId", { unique: false })
        }

        if (!db.objectStoreNames.contains('fertilidadeSolo')) {
            objectStore = db.createObjectStore('fertilidadeSolo', {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("configuracaoId", "configuracaoId", { unique: false })
        }
    }
}

class IndexedDbRepository extends IndexedDbTablesRepository {
    constructor() {
        super()
        this.opened = false
        this.database = undefined
        this.transaction = undefined
    }

    get open() {
        return new Promise((resolve, reject) => {
            if (this.opened) {
                resolve(false)
            }
            else {
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
                }
                else {
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


self.addEventListener('activate', event => {
    // const broadcast = new BroadcastChannel('notifications')
    // broadcast.postMessage({title:'ativado o sw'})
    // broadcast.close()
})

const request = async event => {
    // ExtendableMessageEvent
    const uuid = event.data.uuid ? event.data.uuid : 0
        const manager = event.data.manager ? event.data.manager : 'global'
        const client = await clients.get(event.source.id)
        if (client) {
            client.postMessage({
                uuid: uuid,
                manager: manager,
                payload: {
                    title: 'resposta do envio',
                },
            })
        }
}

self.addEventListener('message', event => {
    event.respondWith(request)
})