import { SchemaError } from "./errors/SchemaError.mjs"

export class Schema {

    /**
     * @returns {string}
     */
    static get KEY() {
        return 'key'
    }

    /**
     * @returns {string}
     */
    static get HEAVY() {
        return 'heavy'
    }

    /**
     * @returns {string}
     */
    static get INDEX() {
        return 'index'
    }

    /**
     * @returns {string}
     */
    static get SCALAR() {
        return 'scalar'
    }

    /**
     * @returns {string}
     */
    static get UNIQUE() {
        return 'unique'
    }

    /**
     * @returns {string}
     */
    static get AUTO_INCREMENT() {
        return 'autoIncrement'
    }

    /**
     * @var {IDBObjectStore}
     */
    #data

    /**
     * @var {IDBObjectStore}
     */
    #index

    /**
     * @var {string}
     */
    #table

    /**
     * @var {object}
     */
    #columns

    /**
     * @var {IDBDatabase}
     */
    #connection

    /**
     * @param {IDBDatabase} event 
     */
    constructor(connection, table) {
        this.#table = table
        this.#columns = {}
        this.#connection = connection
    }

    /**
     * @returns {boolean}
     */
    get exists() {
        for (let name of [
            `${this.#table}_data`,
            `${this.#table}_index`,
        ]) {
            if (this.#connection.objectStoreNames.contains(name)) {
                return true
            }
        }
        return false
    }

    /**
     * @param {string} name 
     * @param {object} options 
     */
    column(name, options = {}) {
        this.#columns[name] = options
    }

    create() {
        let options = {
            keyPath: 'id',
            autoIncrement: true,
        }
        for (let colum in this.#columns) {
            if (this.#columns[colum][Schema.KEY] === true) {
                options = {
                    keyPath: colum,
                }
                if (this.#columns[colum][Schema.AUTO_INCREMENT] === true) {
                    options = {
                        keyPath: colum,
                        autoIncrement: true,
                    }
                }
                if (this.#columns[colum][Schema.SCALAR] === false) {
                    throw new SchemaError('column key should be scalar')
                }
                if (this.#columns[colum][Schema.HEAVY] === true) {
                    throw new SchemaError('column key do not should be heavy data')
                }
                break
            }
        }
        this.#index = this.#connection.createObjectStore(`${this.#table}_index`, options)
        for (let colum in this.#columns) {
            if (this.#columns[colum][Schema.INDEX] === true) {
                if (this.#columns[colum][Schema.KEY] === true) {
                    throw new SchemaError('column key do not should be key of table')
                }
                if (this.#columns[colum][Schema.HEAVY] === true) {
                    throw new SchemaError('column key do not should be heavy data')
                }
                if (this.#columns[colum][Schema.AUTO_INCREMENT] === true) {
                    throw new SchemaError('column key do not should be auto increment')
                }
                this.#index.createIndex(colum, colum, {
                    unique: this.#columns[colum][Schema.UNIQUE] === true,
                    multiEntry: this.#columns[colum][Schema.SCALAR] === false,
                })
            }
        }
        this.#data = this.#connection.createObjectStore(`${this.#table}_data`, {
            keyPath: options.keyPath
        })
        for (let colum in this.#columns) {
            if (this.#columns[colum][Schema.HEAVY] === true) {
                if (this.#columns[colum][Schema.KEY] === true) {
                    throw new SchemaError('column key do not should be key of table')
                }
                if (this.#columns[colum][Schema.INDEX] === true) {
                    throw new SchemaError('column key do not should be index')
                }
                if (this.#columns[colum][Schema.AUTO_INCREMENT] === true) {
                    throw new SchemaError('column key do not should be auto increment')
                }
                this.#connection.createObjectStore(`${this.#table}_${colum}_data`, {
                    keyPath: options.keyPath
                })
            }
        }
    }

    update() {

    }

    drop() { }

    save() {
        return this.exists ? this.update() : this.create()
    }
}