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

    constructor() {

    }

    save() {
        const error = new Error()
        console.log(error.stack)
        console.log(this.constructor.table)
    }
}