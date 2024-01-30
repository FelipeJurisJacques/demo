import { Select } from "./Select.mjs"

export class Query {
    #mode
    #trace
    #table
    #tables
    #database
    #prototype

    constructor(stream) {
        this.#mode = stream.mode
        this.#trace = stream.trace
        this.#table = stream.table
        this.#tables = stream.tables
        this.#database = stream.database
        this.#prototype = stream.prototype
    }

    select() {
        return new Select({
            mode: this.#mode,
            trace: this.#trace,
            table: this.#table,
            tables: this.#tables,
            database: this.#database,
            prototype: this.#prototype,
        })
    }

    insert(data) { }

    update(data) { }
}