export class Cursor {

    /**
     * @var {Event}
     */
    #event

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {Array}
     */
    #queue

    /**
     * @var {IDBRequest}
     */
    #request

    /**
     * @param {IDBRequest} request 
     */
    constructor(request) {
        this.#queue = []
        this.#request = request
        this.#request.onerror = event => {
            this.#error = new Error('error cursor')
            for (let reject of this.#queue) {
                reject(this.#error)
            }
            console.log(event)
        }
        this.#request.onsuccess = event => {
            if (this.#queue.length > 0) {
                const cursor = event.target.result
                const resolve = this.#queue.shift()
                if (cursor) {
                    cursor.continue()
                    resolve(cursor.value)
                } else {
                    resolve(null)
                }
            } else {
                this.#event = event
            }
        }
    }

    fetch() {
        return new Promise(async (resolve, reject) => {
            if (this.#error) {
                reject(this.#error)
            } else if (this.#event) {
                const cursor = this.#event.target.result
                this.#event = null
                if (cursor.value) {
                    cursor.continue()
                    resolve(cursor.value)
                } else {
                    resolve(null)
                }
            } else {
                this.#queue.push(value => {
                    if (value && value instanceof Error) {
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            }
        })
    }

    #wait(ms) {
        return new Promise(resolve => {
            console.log('aguardando')
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }
}