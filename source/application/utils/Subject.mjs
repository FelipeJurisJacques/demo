export class Subject {
    #handlers

    constructor() { }

    subscribe(observer) {
        if (this.#handlers === undefined) {
            this.#handlers = []
        }
        this.#handlers.push(observer)
    }

    notify(data) {
        for (let handler of this.#handlers) {
            handler.notify(data)
        }
    }
}