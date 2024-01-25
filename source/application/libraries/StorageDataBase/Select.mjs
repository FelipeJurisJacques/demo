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
                            cursor.continue()
                            resolve(cursor.value)
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
                if (cursor.value) {
                    cursor.continue()
                    resolve(cursor.value)
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
        return new Promise(async resolve => {
            const list = []
            let value
            while (true) {
                value = await this.fetch()
                if (value) {
                    list.push(value)
                } else {
                    break
                }
            }
            resolve(list)
        })
    }
}