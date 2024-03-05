import { DataBaseConnection } from "./resources/DataBaseConnection.mjs"

export class Connection extends DataBaseConnection {

    /**
     * @var {DataBaseConnection[]}
     */
    static #connections = []

    /**
     * @param {string} name
     * @returns {DataBaseConnection}
     */
    static from(name) {
        if (this.#connections) {
            for (let connection of this.#connections) {
                if (connection.name === name) {
                    return connection
                }
            }
        }
        const connection = new Connection(name)
        this.#connections.push()
        return connection
    }

    /**
     * @param {string|string[]} names
     * @param {boolean} write
     * @returns {Transaction}
     */
    transaction(names, write = true) {
        const n = []
        const list = typeof names === 'string' ? [names] : names
        const storages = this.storages
        for (let name of list) {
            for (let store of storages) {
                if (store === name || store === `${name}_data`) {
                    n.push(store)
                }
            }
        }
        return super.transaction(n, write)
    }
}