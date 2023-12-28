import { Connection } from "./Connection.mjs"

export class Query {

    /**
     * @var {int}
     */
    #mode

    /**
     * @var {string}
     */
    #table

    /**
     * @var {Connection}
     */
    #connection

    static connection(name) {
        return new Query(Connection.from(name))
    }

    static equal(index, value) {

    }

    static lowerBound(index, value) {

    }

    static upperBound(index, value) {

    }

    /**
     * @param {Connection} connection 
     */
    constructor(connection) {
        this.#connection = connection
    }

    from(table) {
        this.#table = table
    }

    where(operator) { }

    having(calback) { }

    fetch() {

    }

    all() {

    }
}