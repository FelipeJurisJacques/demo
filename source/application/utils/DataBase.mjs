import { ServiceWorker } from "./ServiceWorker.mjs";
import { DataBase as Kernel } from "../kernels/DataBase.mjs";

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