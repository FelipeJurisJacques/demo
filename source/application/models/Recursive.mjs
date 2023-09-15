import { IndexedDataBase } from "../utils/IndexedDataBase.mjs";

const handler = {
    get: function (target, key) {
        return target.getValue(key)
    },
    set: function (target, key, value) {
        return target.setValue(key, value)
    },
}

export class Recursive {
    static #connection

    #payload

    static get #database() {
        return 'recursive'
    }

    static get #table() {
        return 'storage'
    }

    static get #primaryKey() {
        return 'id'
    }

    static get #foreignerKey() {
        return 'parent'
    }

    static async #storage(write = true) {
        if (!this.#connection) {
            this.#connection = IndexedDataBase.from(this.#database)
        }
        if (!this.#connection.opened) {
            await this.#connection.open()
        }
        const transaction = this.#connection.transaction(this.#table, write)
        return transaction.storage(this.#table)
    }

    static async base() {
        const storage = this.#storage(false)
        const data = await storage.get(1)
        const target = new Recursive(data)
        const instance = new Proxy(target, handler)
        return instance
    }

    constructor(payload) {
        this.#payload = payload ? payload : {
            parent: 0,
            data: {},
        }
    }

    async setValue(key, value) {
        this.#payload.data[key] = value
        return true
    }

    async getValue(key) {
        const value = this.#payload.data[key]
        if (typeof value === 'object') {

        }
        return value
    }
}