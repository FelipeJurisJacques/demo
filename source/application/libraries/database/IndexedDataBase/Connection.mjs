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
        const connection = new DataBaseConnection(name)
        this.#connections.push()
        return connection
    }
}