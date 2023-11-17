import { Pointer } from "../utils/Pointer.mjs"
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
function pointer(event) {
    console.log(event.type)
    if (event.target && event.target.notify) {
        event.target.notify(event)
        event.target.notify({
            type: 'pointer',
            target: event.target,
            pointer: new Pointer(event),
        })
    }
}
window.addEventListener('click', pointer)
window.addEventListener('pointerup', pointer)
window.addEventListener('pointerout', pointer) // diretamente ao elemento
window.addEventListener('pointerover', pointer) // diretamente ao elemento
window.addEventListener('pointerdown', pointer)
window.addEventListener('pointermove', pointer)
window.addEventListener('pointerenter', pointer) // considera elementos filhos
window.addEventListener('pointerleave', pointer) // considera elementos filhos
window.addEventListener('pointercancel', pointer)
// window.addEventListener('gotpointercapture', pointer)
// window.addEventListener('lostpointercapture', pointer)