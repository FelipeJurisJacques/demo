import { Calendar } from "../utils/Calendar.mjs";
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

    /**
     * @var {IndexedDataBase}
     */
    static #connection

    /**
     * @var {IndexedDataBaseTransaction}
     */
    #transaction

    /**
     * @var {number}
     */
    #id

    /**
     * @var {object}
     */
    #data

    /**
     * @var {number}
     */
    #update

    /**
     * @var {number}
     */
    #parent

    /**
     * @var {number}
     */
    #interaction

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

    /**
     * @param {boolean} write
     * @returns {IndexedDataBaseObjectStore}
     */
    async #storage(write = true) {
        if (!Recursive.#connection) {
            Recursive.#connection = IndexedDataBase.from(Recursive.#database)
        }
        if (
            !this.#transaction
            || this.#transaction.done
            || (write && this.#transaction.mode !== 'readwrite')
        ) {
            this.#transaction = await Recursive.#connection.transaction(Recursive.#table, write)
        }
        return this.#transaction.storage(Recursive.#table)
    }

    static async base() {
        const target = new Recursive()
        const storage = await target.#storage(false)
        const index = storage.index(this.#foreignerKey)
        const payload = await index.get(0)
        if (payload) {
            target.#id = payload.id
            target.#data = payload.data
            target.#parent = payload.parent
            target.#update = payload.update
        } else {
            target.#data = {}
            target.#parent = 0
        }
        const instance = new Proxy(target, handler)
        return instance
    }

    constructor() {
        this.#interaction = 0
    }

    setValue(key, value) {
        if (!this.#data[key] || this.#data[key] !== value) {
            this.#data[key] = value
            this.#interaction++
            this.#autoSave(this.#interaction)
        }
        return true
    }

    getValue(key) {
        return this.#data[key]
    }

    async save() {
        const storage = await this.#storage(true)
        this.#update = Calendar.timestamp()
        if (this.#id) {
            await storage.put({
                id: this.#id,
                data: this.#data,
                parent: this.#parent,
                update: this.#update,
            })
        } else {
            this.#id = await storage.add({
                data: this.#data,
                parent: this.#parent,
                update: this.#update,
            })
        }
        console.log(this)
    }

    #autoSave(interaction) {
        setTimeout(() => {
            if (interaction === this.#interaction) {
                this.save()
            }
        }, 1)
    }
}