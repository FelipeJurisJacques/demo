import { Select } from "./Select.mjs"
import { Connection } from "./Connection.mjs"

export class Model {

    static find() {
        console.log(this.database)
    }

    /**
     * @returns {Promise<Select>}
     */
    static async select() {
        const connection = Connection.from(this.database)
        const transaction = await connection.transaction(this.table, false)
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
    serialize() {
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
        const data = this.serialize()
        const connection = Connection.from(this.constructor.database)
        if (!connection.opened) {
            connection.open()
        }
        const transaction = connection.transaction(this.constructor.table, false)
        const statement = transaction.query(this.table)
        const key = statement.key
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

        }
        return false
    }
}