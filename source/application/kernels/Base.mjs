import { Subject } from "../utils/Subject.mjs"

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
HTMLBodyElement.prototype.unsubscribe = function (observer) {
    if (this.subject) {
        this.subject.unsubscribe(observer)
    }
}
window.document.body.addEventListener('click', function (event) {
    if (event.target && event.target.notify) {
        event.target.notify(event)
    }
})