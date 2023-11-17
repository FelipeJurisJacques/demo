import { Subject } from "../utils/Subject.mjs"
import { Pointer } from "../utils/Pointer.mjs"

export class Builder {
    static head(widget = {}) {
        return window.document.head.rebuild(widget)
    }

    static body(widget = {}) {
        return window.document.body.rebuild(widget)
    }

    static build(widget = {}) {
        if (widget instanceof HTMLElement) {
            return widget
        }
        const element = window.document.createElement(widget.tag)
        element.rebuild(widget)
        return element
    }
}

// BUILDER
Document.prototype.build = Builder.build
HTMLElement.prototype.rebuild = function (widget = {}) {
    for (let name in widget) {
        switch (name) {
            case 'tag':
                break
            case 'id':
            case 'src':
            case 'type':
            case 'width':
            case 'height':
                this[name] = widget[name]
                break
            case 'class':
                this.className = widget.class
                break
            case 'content':
                if (typeof widget.content === 'object') {
                    if (widget.content instanceof URL) {
                        fetch(widget.content).then(response => {
                            response.text().then(body => {
                                this.innerText = body
                            })
                        })
                    }
                } else {
                    this.innerText = widget.content
                }
                break
            case 'child':
                if (typeof widget.child === 'object') {
                    if (widget.child instanceof URL) {
                        fetch(widget.child).then(response => {
                            response.text().then(body => {
                                this.innerHTML = body
                            })
                        })
                    }
                } else {
                    this.appendChild(window.document.build(widget.child))
                }
                break
            case 'children':
                for (let child of widget.children) {
                    this.appendChild(window.document.build(child))
                }
                break
            default:
                this.setAttribute(name, widget[name])
                break
        }
    }
    return this
}

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
function observer(event) {
    if (event.target && event.target.notify) {
        event.target.notify(event)
    }
}
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
window.addEventListener('click', observer)
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