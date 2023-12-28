export class Index {

    /**
     * @var {IDBIndex}
     */
    #index

    /**
     * @param {IDBIndex} index
     */
    constructor(index) {
        this.#index = index
    }

    /**
     * @returns {String}
     */
    get column() {
        return this.#index.name
    }

    /**
     * @param {any} value
     * @returns {Promise<object|null>}
     */
    get(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.get(value)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get'))
            }
            request.onsuccess = event => {
                resolve(event.target.result)
            }
        })
    }

    /**
     * @param {any} value
     * @returns {Promise<Array<Object>>}
     */
    all(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.getAll(value)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to get all'))
            }
            request.onsuccess = event => {
                resolve(event.target.result)
            }
        })
    }

    /**
     * @param {any} value 
     * @returns {Promise<boolean>}
     */
    empty(value) {
        return new Promise((resolve, reject) => {
            const request = this.#index.openCursor(value)
            request.onerror = event => {
                reject(event.target.error ? event.target.error : new Error('Error to index cursor'))
            }
            request.onsuccess = () => {
                resolve(!request.result)
            }
        })
    }

    /**
     * @param {String} value 
     * @returns {Promise<Array>}
     */
    like(value) {
        return new Promise((resolve, reject) => {
            let end = value.substring(value.length - 1) === '%'
            let start = value.substring(0, 1) === '%'
            if (!end && !start) {
                reject(new Error('Invalid like value'))
            } else {
                let range = null
                if (end) {
                    value = value.substring(0, value.length - 1)
                } else if (start) {
                    value = value.substring(1)
                }
                if (end && !start) {
                    range = IDBKeyRange.upperBound(value)
                } else if (!end && start) {
                    range = IDBKeyRange.lowerBound(value)
                }
                const result = []
                const request = range ? this.#index.openCursor(range) : this.#index.openCursor()
                request.onerror = () => {
                    reject(new Error('Error to index cursor'))
                }
                const column = this.column
                request.onsuccess = () => {
                    if (request.result) {
                        const value = request.result.value[column]
                        if (
                            (end && start && value.includes(value))
                            || (end && !start && value.endsWith(value))
                            || (!end && start && value.startsWith(value))
                        ) {
                            result.push(request.result.value)
                        }
                        request.result.continue()
                    } else {
                        resolve(result)
                    }
                }
            }
        })
    }

    /**
     * @param {IDBKeyRange} range
     * @returns {Promise<Array>}
     */
    #cursor(range) {
        return new Promise((resolve, reject) => {
            const result = []
            const request = this.#index.openCursor(range)
            request.onerror = () => {
                reject(new Error('Error to index cursor'))
            }
            request.onsuccess = () => {
                if (request.result) {
                    result.push(request.result.value)
                    request.result.continue()
                } else {
                    resolve(result)
                }
            }
        })
    }
}