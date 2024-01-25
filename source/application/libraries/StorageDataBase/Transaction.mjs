import { Insert } from "./Insert.mjs"
import { Query } from "./Query.mjs"
import { Select } from "./Select.mjs"

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
     * @var {Array<Query>}
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
     * @returns {Query[]}
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
     * @param {storage} name 
     * @returns {Query|null}
     */
    #query(storage = '') {
        const names = this.names
        if (!storage) {
            if (
                names.length > 0
                && names.length < 3
                && `${names[0]}_data` === names[1]
            ) {
                storage = names[0]
            } else {
                throw new Error('storage name invalid')
            }
        }
        if (this.#storages.length > 0) {
            for (let query of this.#storages) {
                if (query.name === storage) {
                    return query
                }
            }
        }
        const storages = []
        for (let name of names) {
            if (name === storage || name === `${storage}_data`) {
                storages.push(this.#transaction.objectStore(name))
            }
        }
        if (storages.length === 0) {
            throw new Error(`${storage} not found`)
        }
        const statement = new Query(storages)
        this.#storages.push(statement)
        return statement
    }

    select(storage) {
        return this.#query(storage).select()
    }

    insert(storage) {
        return this.#query(storage).insert()
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