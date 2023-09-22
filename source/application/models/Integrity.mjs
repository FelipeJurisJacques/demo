import { Calendar } from "../utils/Calendar.mjs";
import { IndexedDataBase } from "../utils/IndexedDataBase.mjs";

const handler = {
    get: function (target, key) {
        return target.getValue(key)
    },
    set: function (target, key, value) {
        target.setValue(key, value)
        return true
    },
    deleteProperty: function (target, key) {
        target.delete(key)
        return true
    },
}

class Entity {
    #id
    #key
    #value
    #parent
    #updated
    #deleted
    #interaction

    constructor(payload = {}) {
        this.#interaction = 0
        this.#id = payload.id
        this.#key = payload.key
        this.#value = payload.value
        this.#parent = payload.parent
        this.#updated = payload.updated
        this.#deleted = payload.deleted ? true : false
    }

    get id() {
        return this.#id
    }

    get key() {
        return this.#key
    }

    get value() {
        return this.#value
    }

    get parent() {
        return this.#parent
    }

    get updated() {
        return this.#updated
    }

    get deleted() {
        return this.#deleted
    }

    set key(value) {
        if (this.#key !== value) {
            this.#key = value
            this.#interaction++
        }
    }

    set value(value) {
        if (this.#value !== value) {
            this.#value = value
            this.#interaction++
        }
    }

    set parent(value) {
        if (this.#parent === undefined) {
            this.#parent = value
            this.#interaction++
        }
    }

    set deleted(value) {
        if (this.#deleted !== value) {
            this.#deleted = value
            this.#interaction++
        }
    }

    save() {
        if (!this.#id && this.#deleted) {
            return
        }
        const interaction = this.#interaction
        setTimeout(async () => {
            if (interaction === this.#interaction) {
                this.#updated = Calendar.timestamp()
                const connection = IndexedDataBase.from('integrity')
                const transaction = await connection.transaction('storage', true)
                const storage = transaction.storage('storage')
                const payload = {
                    key: this.#key,
                    type: null,
                    value: this.#deleted ? null : this.#value,
                    parent: this.#parent,
                    updated: this.#updated,
                    deleted: this.#deleted,
                }
                if (this.#id) {
                    payload.id = this.#id
                    await storage.put(payload)
                } else {
                    this.#id = await storage.add(payload)
                }
                transaction.commit()
            }
        }, 10)
    }
}

export class Integrity {

    /**
     * @var {number}
     */
    #id

    /**
     * @var {array}
     */
    #entities

    /**
     * @var {IndexedDataBase}
     */
    static #connection

    /**
     * @var {IndexedDataBaseTransaction}
     */
    #transaction

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
     * @returns {Promise<Proxy>}
     */
    static async base() {
        const target = new Integrity()
        const instance = new Proxy(target, handler)
        await target.load()
        return instance
    }

    constructor(id = 0) {
        this.#id = id
        this.#entities = []
    }

    async load() {
        const storage = await this.#storage(false)
        const index = storage.index('parent')
        const payloads = await index.all(this.#id)
        for (let payload of payloads) {
            if (payload.type === 'array') {
                this.#entities[payload.key] = new Integrity(payload.id)
            } else {
                let entity = new Entity(payload)
                if (this.#entities[entity.key]) {
                    if (!entity.deleted) {
                        entity.deleted = true
                        entity.save()
                    }
                } else {
                    this.#entities[entity.key] = entity
                }
            }
        }
        return this
    }

    /**
     * @param {number|string} key
     * @param {any} value
     * @returns {void}
     */
    setValue(key, value) {
        if (typeof value === 'function') {
            throw new Error('invalid media type')
        }
        if (this.#entities[key]) {
            const entity = this.#entities[key]
            if (entity.value !== value || entity.deleted) {
                entity.value = value
                entity.deleted = false
                entity.save()
            }
        } else {
            const entity = new Entity()
            entity.key = key
            entity.value = value
            entity.parent = this.#id
            this.#entities[key] = entity
            entity.save()
        }
    }

    /**
     * @param {number|string} key 
     * @returns {boolean|number|string|Promise<Proxy>}
     */
    getValue(key) {
        if (this.#entities[key]) {
            const entity = this.#entities[key]
            if (entity instanceof Entity) {
                return entity.value
            } else {
                return new Promise(async resolve => {
                    if (entity instanceof Integrity) {
                        await entity.load()
                        resolve(new Proxy(entity, handler))
                    } else {
                        resolve(entity)
                    }
                })
            }
        }
        return undefined
    }

    /**
     * @param {number|string} key
     * @returns {void}
     */
    delete(key) {
        if (this.#entities[key]) {
            const entity = this.#entities[key]
            if (!entity.deleted) {
                entity.deleted = true
                entity.save()
            }
        }
    }
}