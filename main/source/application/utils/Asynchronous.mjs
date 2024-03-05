import { Observer } from "../libraries/observer/Observer.mjs"

export class Asynchronous extends Observer {
    #payload
    #received

    constructor() {
        this.#received = false
    }

    static wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }

    async observe(timeout = -1) {
        for (let i = 1; timeout > 0 && i < timeout; i++) {
            if (this.#received) {
                if (
                    this.#payload
                    && typeof this.#payload === 'object'
                    && this.#payload instanceof Error
                ) {
                    throw this.#payload
                }
                return this.#payload
            } else {
                await this.wait(1)
            }
        }
        throw new Error('Timeout');
    }

    notify(data) {
        this.#payload = data
        this.#received = true
    }
}