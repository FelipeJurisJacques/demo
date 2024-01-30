import { Query } from "./Query.mjs"

export class Transaction {
    #mode
    #trace
    #tables
    #database

    constructor(stream) {
        this.#mode = stream.mode
        this.#trace = stream.trace
        this.#tables = stream.tables
        this.#database = stream.database
    }

    query(table, prototype) {
        return new Query({
            mode: this.#mode,
            trace: this.#trace,
            table: table,
            tables: this.#tables,
            database: this.#database,
            prototype: prototype,
        })
    }
}