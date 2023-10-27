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
    if (event.target && event.target.notify) {
        event.target.notify(event)
        event.target.notify({
            type: 'pointer',
            target: event.target,
            pointer: Pointer.state(event),
        })
    }
}
window.addEventListener('click', pointer)
window.addEventListener('pointerup', pointer)
window.addEventListener('pointerout', pointer)
window.addEventListener('pointerover', pointer)
window.addEventListener('pointerdown', pointer)
window.addEventListener('pointermove', pointer)
window.addEventListener('pointerenter', pointer)
window.addEventListener('pointerleave', pointer)
window.addEventListener('pointercancel', pointer)
window.addEventListener('gotpointercapture', pointer)
window.addEventListener('lostpointercapture', pointer)
// Pointer.x = event.clientX
// Pointer.y = event.clientY
// Pointer.grab = event.buttons > 0
// Pointer.type = event.pointerType
// console.log(Pointer.grab)
// if (event.target && event.target.notify) {
//     event.target.notify(event)
// }
// Pointer.down = true
// if (event.target && event.target.notify) {
//     event.target.notify(event)
//     if (Pointer.touch) {
//         const uuid = event.timeStamp
//         Mouse.down = uuid
//         setTimeout(() => {
//             if (Pointer.down && Mouse.down === uuid) {
//                 const e = {}
//                 for (let key in event) {
//                     e[key] = event[key]
//                 }
//                 e.type = 'longclick'
//                 event.target.notify(e)
//             }
//         }, 500)
//     }
// }
// if (event.target && event.target.notify) {
//     Pointer.up = true
//     Pointer.grab = false
//     event.target.notify(event)
//     const uuid = event.timeStamp
//     Mouse.up = uuid
//     setTimeout(() => {
//         if (Pointer.up && Mouse.up !== uuid) {
//             const e = {}
//             for (let key in event) {
//                 e[key] = event[key]
//             }
//             e.type = 'doubleclick'
//             event.target.notify(e)
//         }
//     }, 200)
// }