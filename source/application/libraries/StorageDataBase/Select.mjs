export class Select {

    /**
     * @var {IDBObjectStore}
     */
    #data

    /**
     * @var {string[]}
     */
    #from

    /**
     * @var {number}
     */
    #count

    /**
     * @var {IDBIndex}
    */
    #index

    /**
     * @var {number}
     */
    #limit

    /**
     * @var {IDBKeyRange}
     */
    #range

    /**
     * @var {Event}
     */
    #event

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {Array}
     */
    #queue

    /**
     * @var {string}
     */
    #column

    /**
     * @var {Function}
     */
    #having

    /**
     * @var string[]
     */
    #select

    /**
     * @var {IDBObjectStore}
     */
    #storage

    /**
     * @var {IDBRequest}
     */
    #request

    /**
     * @param {IDBObjectStore} storage
     * @param {IDBObjectStore} data
     */
    constructor(storage, data) {
        this.#storage = storage
        this.#data = data
    }

    /**
     * @param {string} column
     * @param {string} comparator
     * @param {any} value
     * @returns {void}
     */
    where(column, comparator = '=', value) {
        if (column) {
            this.#column = column
        }
        switch (comparator) {
            case '<':
                this.#range = IDBKeyRange.lowerBound(value, false)
                break
            case '<=':
                this.#range = IDBKeyRange.lowerBound(value, true)
                break
            case '>':
                this.#range = IDBKeyRange.upperBound(value, false)
                break
            case '>=':
                this.#range = IDBKeyRange.upperBound(value, true)
                break
            case '=':
            default:
                this.#range = IDBKeyRange.only(value)
                break
        }
    }

    /**
     * @param {Function} callback 
     * @returns {void}
     */
    having(callback) {
        this.#having = callback
    }

    limit(value) {
        this.#limit = value
    }

    fetch() {
        return new Promise(async (resolve, reject) => {
            while (true) {
                let value = await this.#fetch()
                if (value) {
                    if (!this.#having || this.#having(value)) {
                        const id = value[this.#storage.keyPath]
                        const request = this.#data.get(id)
                        request.onerror = event => {
                            reject(event.target.error ? event.target.error : new Error('Error to get'))
                        }
                        request.onsuccess = event => {
                            if (event.target.result) {
                                const data = event.target.result
                                for (let key in data) {
                                    value[key] = data[key]
                                }
                            }
                            resolve(value)
                        }
                        break
                    }
                } else {
                    resolve(null)
                    break
                }
            }
        })
    }

    #fetch() {
        return new Promise((resolve, reject) => {
            if (!this.#request) {
                this.#count = 0
                this.#queue = []
                if (
                    this.#column
                    && (this.#storage.keyPath && this.#storage.keyPath !== this.#column)
                ) {
                    this.#index = this.#storage.index(this.#column)
                }
                if (this.#range) {
                    this.#request = this.#index ? this.#index.openCursor(this.#range) : this.#storage.openCursor(this.#range)
                } else {
                    this.#request = this.#index ? this.#index.openCursor() : this.#storage.openCursor()
                }
                this.#request.onerror = event => {
                    this.#error = event.target.error ? event.target.error : new Error('Error to fetch')
                    for (let reject of this.#queue) {
                        reject(this.#error)
                    }
                }
                this.#request.onsuccess = event => {
                    if (this.#queue.length > 0) {
                        const cursor = event.target.result
                        const resolve = this.#queue.shift()
                        if (cursor) {
                            if (cursor.value) {
                                this.#count++
                                if (!this.#limit || this.#limit > this.#count) {
                                    cursor.continue()
                                }
                                resolve(cursor.value)
                            } else {
                                resolve(null)
                            }
                        } else {
                            resolve(null)
                        }
                    } else {
                        this.#event = event
                    }
                }
            }
            if (this.#error) {
                reject(this.#error)
            } else if (this.#event) {
                const cursor = this.#event.target.result
                this.#event = null
                if (cursor) {
                    if (cursor.value) {
                        this.#count++
                        if (!this.#limit || this.#limit > this.#count) {
                            cursor.continue()
                        }
                        resolve(cursor.value)
                    } else {
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            } else {
                this.#queue.push(value => {
                    if (value && value instanceof Error) {
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            }
        })
    }

    async all() {
        let value
        const list = []
        while (true) {
            value = await this.fetch()
            if (value) {
                list.push(value)
            } else {
                break
            }
        }
        return list
    }
}