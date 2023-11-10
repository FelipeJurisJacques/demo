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

Document.prototype.build = function (widget = {}) {
    if (widget instanceof HTMLElement) {
        return widget
    }
    const element = widget.tag === 'body' ? this.body : this.createElement(widget.tag)
    for (let name in widget) {
        switch (name) {
            case 'tag':
                break
            case 'id':
            case 'src':
            case 'type':
            case 'width':
            case 'height':
                element[name] = widget[name]
                break
            case 'class':
                element.className = widget.class
                break
            case 'content':
                element.innerText = widget.content
                break
            case 'child':
                element.appendChild(this.build(widget.child))
                break
            case 'children':
                for (let child of widget.children) {
                    element.appendChild(this.build(child))
                }
                break
            default:
                element.setAttribute(name, widget[name])
                break
        }
    }
    return element
}