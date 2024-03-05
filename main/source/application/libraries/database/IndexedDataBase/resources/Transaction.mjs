import { ObjectStore } from "./ObjectStore.mjs"

export class Transaction {

    /**
     * @var {boolean}
     */
    #done

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {Array<ObjectStore>}
     */
    #storages

    /**
     * @var {IDBTransaction}
     */
    #transaction

    /**
     * @param {IDBTransaction} transaction 
     */
    constructor(transaction) {
        this.#done = false
        this.#error = null
        this.#storages = []
        this.#transaction = transaction
        this.#transaction.onerror = event => {
            this.#error = event.target.error ? event.target.error : new Error('Transaction error')
            this.#done = true
            console.error(this.error)
        }
        this.#transaction.onabort = event => {
            this.#error = event.target.error ? event.target.error : new Error('Transaction is aborted')
            this.#done = true
            console.error(this.error)
        }
        this.#transaction.oncomplete = event => {
            if (event.target.error) {
                this.#error = event.target.error
            }
            this.#done = true
        }
    }

    /**
     * @returns {boolean}
     */
    get done() {
        return this.#done
    }

    /**
     * @returns {Error|null}
     */
    get error() {
        return this.#transaction.error ? this.#transaction.error : this.#error
    }

    /**
     * @returns {string}
     */
    get mode() {
        this.#transaction.mode
    }

    /**
     * @returns {string[]}
     */
    get names() {
        const list = []
        for (let name of this.#transaction.objectStoreNames) {
            list.push(name)
        }
        return list.length > 1 ? list.sort() : list
    }

    /**
     * @returns {ObjectStore[]}
     */
    get storages() {
        return this.#storages
    }

    commit() {
        if (!this.#done) {
            this.#transaction.commit()
        }
    }

    abort() {
        this.#transaction.abort()
    }

    /**
     * @param {string} name 
     * @returns {ObjectStore|null}
     */
    storage(name) {
        if (this.#storages.length > 0) {
            for (let storage of this.#storages) {
                if (storage.name === name) {
                    return storage
                }
            }
        }
        const object = this.#transaction.objectStore(name)
        const instance = new ObjectStore(object)
        this.#storages.push(instance)
        return instance
    }

    /**
     * @returns {Promise<Error|void}}
     */
    async complete() {
        while (!this.done) {
            await Asynchronous.wait(10)
        }
        if (this.error) {
            throw this.error
        }
        return
    }
}