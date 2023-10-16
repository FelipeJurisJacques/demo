import { Subject } from "../utils/Subject.mjs"

// SUBJECT
HTMLElement.prototype.notify = function (event) {
    if (this.subject) {
        this.subject.notify(event)
    }
}
HTMLElement.prototype.subscribe = function (observer) {
    if (!this.subject) {
        this.subject = new Subject()
    }
    this.subject.subscribe(observer)
}
HTMLElement.prototype.unsubscribe = function (observer) {
    if (this.subject) {
        this.subject.unsubscribe(observer)
    }
}

// OBSERVER
window.document.body.addEventListener('click', function (event) {
    if (event.target && event.target.notify) {
        event.target.notify(event)
    }
})

// MOUSE
class Mouse {
    static #up
    static #down

    static set up(uuid) {
        this.#up = uuid
        this.#down = 0
    }

    static set down(uuid) {
        this.#up = 0
        this.#down = uuid
    }

    static get up() {
        return this.#up
    }

    static get down() {
        return this.#down
    }
}
window.document.body.addEventListener('mousedown', function (event) {
    if (event.target && event.target.notify) {
        event.target.notify(event)
        const uuid = event.timeStamp
        Mouse.down = uuid
        setTimeout(() => {
            if (Mouse.down === uuid) {
                const e = {}
                for (let key in event) {
                    e[key] = event[key]
                }
                e.type = 'longpress'
                event.target.notify(e)
            }
        }, 500)
    }
})
window.document.body.addEventListener('mouseup', function (event) {
    if (event.target && event.target.notify) {
        const uuid = event.timeStamp
        Mouse.up = uuid
        event.target.notify(event)
        setTimeout(() => {
            if (Mouse.up !== uuid) {
                const e = {}
                for (let key in event) {
                    e[key] = event[key]
                }
                e.type = 'doubleclick'
                event.target.notify(e)
            }
        }, 200)
    }
})
// window.addEventListener('mousemove', e => {
//     if (!isResizing) {
//         return
//     }
// })