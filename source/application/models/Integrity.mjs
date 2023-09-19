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

export class Integrity {

    /**
     * @var {IndexedDataBase}
     */
    static #connection

    /**
     * @var {number}
     */
    #parent

    /**
     * @var {object}
     */
    #payload

    /**
     * @var {IndexedDataBaseTransaction}
     */
    #transaction

    /**
     * @var {number}
     */
    #interaction

    /**
     * @param {boolean} write
     * @returns {IndexedDataBaseObjectStore}
     */
    async #storage(write = true) {
        if (!Integrity.#connection) {
            Integrity.#connection = IndexedDataBase.from('integrity')
        }
        if (
            !this.#transaction
            || this.#transaction.done
            || (write && this.#transaction.mode !== 'readwrite')
        ) {
            this.#transaction = await Integrity.#connection.transaction('storage', write)
        }
        return this.#transaction.storage('storage')
    }

    /**
     * @returns {Proxy}
     */
    static base() {
        return this.#load(0)
    }

    /**
     * @param {number} id 
     * @returns {Proxy}
     */
    static async #load(id) {
        const target = new Integrity()
        const instance = new Proxy(target, handler)
        if (!Integrity.#connection) {
            Integrity.#connection = IndexedDataBase.from('integrity')
        }
        const transaction = await Integrity.#connection.transaction('storage', false)
        const storage = transaction.storage('storage')
        const index = storage.index('parent')
        const payloads = await index.all(id)
        target.#parent = id
        for (let payload of payloads) {
            target.#payload[payload.key] = payload.value
        }
        return instance
    }

    constructor() {
        this.#parent = 0
        this.#payload = {}
        this.#interaction = 0
    }

    setValue(key, value) {
        if (this.#payload[key] !== value) {
            this.#payload[key] = value
            this.#interaction++
            this.#autoSave(this.#interaction)
        }
        return true
    }

    getValue(key) {
        return this.#payload[key]
    }

    async save() {
        const time = Calendar.timestamp()
        const storage = await this.#storage(true)
        const index = storage.index('parent')
        const payloads = await index.all(this.#parent)
        let value
        let payload
        for (let key in this.#payload) {
            value = this.#payload[key]
            payload = null
            for (let p of payloads) {
                if (p.key === key) {
                    payload = p
                    break
                }
            }
            if (payload) {
                if (payload.value !== value) {
                    payload.value = value
                    payload.update = time
                    storage.put(payload)
                }
            } else {
                storage.add({
                    key: key,
                    child: null,
                    value: value,
                    parent: this.#parent,
                    update: time,
                    created: time,
                    deleted: false,
                })
            }
        }
        this.#transaction.commit()
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