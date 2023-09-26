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

export class Integrity {
    #id
    #key
    #value
    #parent
    #deleted
    #updated
    #multiple
    #interaction

    /**
     * @returns {Promise<Proxy>}
     */
    static async base() {
        const instance = new Integrity()
        instance.#id = 0
        instance.#multiple = true
        await instance.load()
        return new Proxy(instance, handler)
    }

    constructor(payload = {}) {
        this.#interaction = 0
        this.#id = payload.id
        this.#key = payload.key
        this.#value = payload.value
        this.#parent = payload.parent
        this.#deleted = payload.deleted ? true : false
        this.#updated = payload.updated
        this.#multiple = payload.multiple ? true : false
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

    get deleted() {
        return this.#deleted
    }

    get updated() {
        return this.#updated
    }

    get multiple() {
        return this.#multiple
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
            this.#multiple = value && typeof value === 'object'
            this.#interaction++
        }
    }

    set parent(value) {
        if (!this.#parent) {
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

    async load() {
        if (this.#multiple) {
            this.#value = []
            const connection = IndexedDataBase.from('integrity')
            const transaction = await connection.transaction('storage', false)
            const storage = transaction.storage('storage')
            const index = storage.index('parent')
            const payloads = await index.all(this.#id)
            for (let payload of payloads) {
                let entity = new Integrity(payload)
                this.#value[entity.key] = entity
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
        if (this.#value.hasOwnProperty(key)) {
            const entity = this.#value[key]
            if (entity.deleted || entity.value !== value) {
                entity.value = value
                entity.deleted = false
                entity.save()
            }
        } else {
            const entity = new Integrity()
            entity.key = key
            entity.value = value
            entity.parent = this.#id
            this.#value[key] = entity
            entity.save()
        }
    }

    /**
     * @param {number|string} key 
     * @returns {boolean|number|string|Promise<Proxy>}
     */
    getValue(key) {
        if (this.#value.hasOwnProperty(key)) {
            const entity = this.#value[key]
            if (!entity.deleted) {
                if (entity.multiple) {
                    return new Promise(async resolve => {
                        const instance = new Integrity(entity)
                        await instance.load()
                        resolve(new Proxy(instance, handler))
                    })
                } else {
                    return entity.value
                }
            }
        }
        return undefined
    }

    /**
     * @param {number|string} key
     * @returns {void}
     */
    delete(key) {
        if (this.#value.hasOwnProperty(key)) {
            const entity = this.#value[key]
            if (!entity.deleted) {
                entity.deleted = true
                entity.save()
            }
        }
    }

    save() {
        if (!this.#id && this.#deleted) {
            return
        }
        if (typeof this.#value === 'function') {
            return
        }
        const interaction = this.#interaction
        setTimeout(async () => {
            if (interaction === this.#interaction) {
                this.#updated = Calendar.timestamp()
                const connection = IndexedDataBase.from('integrity')
                const transaction = await connection.transaction('storage', true)
                const storage = transaction.storage('storage')
                if (this.#id) {
                    const index = storage.index('parent')
                    if (this.#deleted) {
                        await this.#delete(storage, index, {
                            id: this.#id,
                            key: this.#key,
                            parent: this.#parent,
                            multiple: this.#multiple,
                        })
                        this.#value = null
                    } else {
                        await this.#put(storage, index, {
                            id: this.#id,
                            key: this.#key,
                            value: this.#value,
                            parent: this.#parent,
                            multiple: this.#multiple,
                        })
                    }
                } else {
                    this.#id = await this.#add(storage, {
                        key: this.#key,
                        value: this.#value,
                        parent: this.#parent,
                        multiple: this.#multiple,
                    })
                }
                transaction.commit()
                if (this.#multiple && typeof this.#value === 'object') {
                    this.#value = null
                }
            }
        }, 10)
    }

    async #add(storage, payload) {
        payload.deleted = false
        payload.updated = this.#updated
        if (payload.multiple) {
            const values = payload.value
            payload.value = null
            const id = await storage.add(payload)
            for (let key in values) {
                let value = values[key]
                await this.#add(storage, {
                    key: key,
                    value: value,
                    parent: id,
                    multiple: value && typeof value === 'object',
                })
            }
            return id
        } else {
            return await storage.add(payload)
        }
    }

    async #put(storage, index, payload) {
        if (payload.id) {
            payload.deleted = false
            payload.updated = this.#updated
            if (payload.multiple) {
                const values = payload.value
                payload.value = null
                await storage.put(payload)
                const payloads = await index.all(payload.id)
                for (let payload of payloads) {
                    if (values.hasOwnProperty(payload.key)) {
                        let value = values[payload.key]
                        if (payload.deleted || payload.value !== value) {
                            payload.value = value
                            payload.multiple = value && typeof value === 'object'
                            await this.#put(storage, index, payload)
                        }
                        delete values[payload.key]
                    } else if (!payload.deleted || payload.value !== null) {
                        await this.#delete(storage, index, payload)
                    }
                }
                for (let key in values) {
                    let value = values[payload.key]
                    await this.#add(storage, {
                        key: key,
                        value: value,
                        parent: payload.id,
                        deleted: false,
                        updated: this.#updated,
                        multiple: value && typeof value === 'object',
                    })
                }
            } else {
                await storage.put(payload)
                const payloads = await index.all(payload.id)
                for (let payload of payloads) {
                    if (!payload.deleted || payload.value !== null) {
                        await this.#delete(storage, index, payload)
                    }
                }
            }
        }
    }

    async #delete(storage, index, payload) {
        if (payload.id) {
            payload.value = null
            payload.deleted = true
            payload.updated = this.#updated
            await storage.put(payload)
            const payloads = await index.all(payload.id)
            for (let payload of payloads) {
                if (!payload.deleted || payload.value !== null) {
                    await this.#delete(storage, index, payload)
                }
            }
        }
    }
}