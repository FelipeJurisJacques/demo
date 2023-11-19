import { Subject } from "../utils/Subject.mjs"
import { Pointer } from "../utils/Pointer.mjs"

export class Builder {
    static head(widget = {}) {
        return this.rebuild(window.document.head, widget)
    }

    static body(widget = {}) {
        return this.rebuild(window.document.body, widget)
    }

    static build(widget = {}) {
        if (widget instanceof HTMLElement) {
            return widget
        }
        return this.rebuild(window.document.createElement(widget.tag), widget)
    }

    static rebuild(element, widget) {
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
                    this.#append(element, widget.child)
                    break
                case 'children':
                    for (let child of widget.children) {
                        this.#append(element, child)
                    }
                    break
                default:
                    element.setAttribute(name, widget[name])
                    break
            }
        }
        return element
    }

    static #append(element, widget) {
        if (typeof widget === 'object' && widget instanceof URL) {
            fetch(widget).then(async response => {
                element.innerHTML = await response.text()
            })
        } else {
            element.appendChild(this.build(widget))
        }
    }
}

// BUILDER
Document.prototype.build = Builder.build
HTMLElement.prototype.rebuild = function (widget = {}) {
    Builder.rebuild(this, widget)
}

function notify(event) {
    if (this.subject) {
        this.subject.notify(event)
    }
    if (this.parentElement && this.parentElement.notify) {
        this.parentElement.notify(event)
    }
}
function subscribe(observer) {
    if (!this.subject) {
        this.subject = new Subject()
    }
    this.subject.subscribe(observer)
}
function unsubscribe(observer) {
    if (this.subject) {
        this.subject.unsubscribe(observer)
    }
}
function observer(event) {
    if (event.target && event.target.notify) {
        event.target.notify(event)
    }
}
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

// SUBJECT
SVGElement.prototype.notify = notify
HTMLElement.prototype.notify = notify
SVGElement.prototype.subscribe = subscribe
HTMLElement.prototype.subscribe = subscribe
SVGElement.prototype.unsubscribe = unsubscribe
HTMLElement.prototype.unsubscribe = unsubscribe

// OBSERVER
window.addEventListener('click', observer)
window.addEventListener('pointerup', pointer)
window.addEventListener('pointerout', pointer) // diretamente ao elemento
window.addEventListener('pointerover', pointer) // diretamente ao elemento
window.addEventListener('pointerdown', pointer)
window.addEventListener('pointermove', pointer)
window.addEventListener('pointerenter', pointer) // considera elementos filhos
window.addEventListener('pointerleave', pointer) // considera elementos filhos
window.addEventListener('pointercancel', pointer)
window.addEventListener('gotpointercapture', pointer)
window.addEventListener('lostpointercapture', pointer)