import { Select } from "./Select.mjs"
import { IndexedDataBase } from "./IndexedDataBase.mjs"

export class Model {

    static find() {
        console.log(this.database)
    }

    /**
     * @returns {Select}
     */
    static select() {
        const connection = new IndexedDataBase(this.database)
        const transaction = connection.transaction(this.table, false)
        const statement = transaction.query(this.table, this.prototype)
        return statement.select()
    }

    static get table() {
        throw new Error('implements')
    }

    static get database() {
        throw new Error('implements')
    }

    constructor() { }

    /**
     * @returns {object}
     */
    toJSON() {
        const data = {}
        for (let key in this) {
            data[key] = this[key]
        }
        return data
    }

    /**
     * @returns {Promise<boolean>}
     */
    async save() {
        const data = this.toJSON()
        const connection = new IndexedDataBase(this.constructor.database)
        const transaction = connection.transaction(this.constructor.table, true)
        const statement = transaction.query(this.constructor.table, this.constructor.prototype)
        const key = await statement.key
        if (!key) {
            await statement.insert(data)
            return true
        } else if (!data[key]) {
            const id = await statement.insert(data)
            if (id) {
                this[key] = id
                return true
            }
        } else {
            return await statement.update(data)
        }
        return false
    }
}