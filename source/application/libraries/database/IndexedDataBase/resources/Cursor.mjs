export class Cursor {

    /**
     * @var {Error}
     */
    #error

    /**
     * @var {Array}
     */
    #queue

    /**
     * @var {bool}
     */
    #started

    /**
     * @var {bool}
     */
    #finalized

    /**
     * @param {IDBRequest} request 
     */
    constructor(request) {
        this.#queue = []
        this.#started = false
        this.#finalized = false
        request.onerror = event => {
            this.#error = new Error('error cursor')
            this.#finalized = true
            console.log(event)
        }
        request.onsuccess = event => {
            if (this.#started && !this.#finalized) {
                if (request.result) {
                    this.#queue.push(request.result.value)
                    request.result.continue()
                } else {
                    this.#finalized = true
                }
            }
            console.log(event)
        }
    }

    fetch() {
        this.#started = true
        return new Promise(async (resolve, reject) => {
            if (this.#error) {
                reject(this.#error)
            } else {
                let value = null
                while (!this.#finalized) {
                    if (this.#queue.length === 0) {
                        await this.#wait(1)
                    } else {
                        value = this.#queue.shift()
                        break
                    }
                }
                resolve(value)
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