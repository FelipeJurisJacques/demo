import { Subject } from "../observer/Subject.mjs"

/**
 * shared worker que pode se comunicar com varios scripts que compartilham a mesma origem
 */
export class SharedWorker extends Subject {

    #port

    /**
     * @var {SharedWorker}
     */
    #worker

    /**
     * @var {function[]}
     */
    #queue

    constructor(file, name) {
        super()
        this.#queue = []
        this.#worker = new window.SharedWorker(file, {
            name: name,
            type: 'module',
        })
        this.#port = this.#worker.port
        this.#port.onmessage = event => {
            console.log(event.data)
            // if (event.data && event.data.id && typeof event.data === 'number') {
            //     if (this.#queue.length > 0) {
            //         const resolve = this.#queue.shift()
            //         resolve(event.data)
            //     }
            // } else {
            //     this.notify(event.data, this)
            // }
        }
    }

    post(data, manager = '') {
        this.#port.postMessage({
            data: data,
            manager: manager,
        })
        return new Promise(resolve => {
            resolve(0)
        })
        // return new Promise(resolve => {
        //     this.#queue.push(resolve)
        //     this.#worker.port.postMessage({
        //         data: data,
        //         manager: manager,
        //     })
        // })
    }
}