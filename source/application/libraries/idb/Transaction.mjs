import { Query } from "./Query.mjs"

export class Transaction {

    #mode
    #trace
    #tables
    #worker
    #connection
    #subscription

    constructor(stream) {
        this.#mode = stream.mode
        this.#trace = stream.trace
        this.#tables = stream.tables
        this.#worker = stream.worker
        this.#connection = stream.connection
        this.#worker.subscribe(message => {
            if (message.manager === 'transaction') {
                console.log(message)
            }
        })
        this.#worker.post({
            transaction: {
                mode: this.#mode,
                trace: this.#trace,
                tables: this.#tables,
            },
        }, 'transaction').then(id => {
            this.#subscription = id
        })
    }

    query(table, prototype) {
        return
        return new Query({
            mode: this.#mode,
            trace: this.#trace,
            table: table,
            tables: this.#tables,
            connection: this.#connection,
            prototype: prototype,
        })
    }
}