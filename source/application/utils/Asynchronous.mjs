import { Observer } from "./Observer.mjs"

export class Asynchronous extends Observer {
    #payload

    static wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }

    async observe(timeout = -1) {
        for (let i = 1; timeout > 0 && i < timeout; i++) {
            if (this.#payload === undefined) {
                await this.wait(1)
            } else {
                return this.#payload
            }
        }
        throw new Error('Timeout');
    }

    notify(data) {
        this.#payload = data
    }
}