import { Subject } from "../utils/Subject.mjs"
import { Pointer } from "../utils/Pointer.mjs"

export class Builder {
    static #events = []
    static #lastUp = 0
    static #lastDown = 0
    static #lastClick = 0

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
                case 'onClick':
                    this.#subscribe('click')
                    element.subjectClick = widget[name]
                    break
                case 'onDoubleClick':
                    this.#subscribe('click')
                    element.subjectDoubleClick = widget[name]
                    break
                case 'onLongClick':
                    this.#subscribe('pointerup')
                    this.#subscribe('pointerdown')
                    element.subjectLongClick = widget[name]
                    break
                case 'onPointerUp':
                    this.#subscribe('pointerup')
                    element.subjectPointerUp = widget[name]
                    break
                case 'onPointerOut':
                    this.#subscribe('pointerout')
                    element.subjectPointerOut = widget[name]
                    break
                case 'onPointerOver':
                    this.#subscribe('pointerover')
                    element.subjectPointerOver = widget[name]
                    break
                case 'onPointerDown':
                    this.#subscribe('pointerdown')
                    element.subjectPointerDown = widget[name]
                    break
                case 'onPointerMove':
                    this.#subscribe('pointermove')
                    element.subjectPointerMove = widget[name]
                    break
                case 'onPointerEnter':
                    this.#subscribe('pointerenter')
                    element.subjectPointerEnter = widget[name]
                    break
                case 'onPointerLeave':
                    this.#subscribe('pointerleave')
                    element.subjectPointerLeave = widget[name]
                    break
                case 'onPointerCancel':
                    this.#subscribe('pointercancel')
                    element.subjectPointerCancel = widget[name]
                    break
                // case 'gotpointercapture':
                //     this.#subscribe('gotpointercapture')
                //     element.subjectgotpointercapture = widget[name]
                //     break
                // case 'lostpointercapture':
                //     this.#subscribe('lostpointercapture')
                //     element.subjectlostpointercapture = widget[name]
                //     break
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

    static #subscribe(name) {
        if (this.#events.indexOf(name) < 0) {
            window.addEventListener(name, this.notify)
            this.#events.push(name)
        }
    }

    static notify(event) {
        Builder.#notify(event)
    }

    static #notify(event) {
        let element = event.target
        while (element && !this.#forward(event, element)) {
            element = element.parentElement
        }
        switch (event.type) {
            case 'click':
                this.#lastClick = (new Date()).getTime()
                break
            case 'pointerup':
                this.#lastUp = (new Date()).getTime()
                break
            case 'pointerdown':
                this.#lastDown = (new Date()).getTime()
                break
            default:
                break
        }
    }

    static #forward(event, element) {
        switch (event.type) {
            case 'click':
                if (element.subjectDoubleClick) {
                    const diff = (new Date()).getTime() - this.#lastClick
                    if (diff > 0 && diff < 200) {
                        element.subjectDoubleClick(event)
                    }
                    return true
                }
                if (element.subjectClick) {
                    element.subjectClick(event)
                    return true
                }
                break
            case 'pointerup':
                if (element.subjectPointerUp) {
                    element.subjectPointerUp(event)
                    return true
                }
                break
            case 'pointerout':
                if (element.subjectPointerOut) {
                    element.subjectPointerOut(event)
                    return true
                }
                break
            case 'pointerover':
                if (element.subjectPointerOver) {
                    element.subjectPointerOver(event)
                    return true
                }
                break
            case 'pointerdown':
                if (element.subjectPointerDown) {
                    element.subjectPointerDown(event)
                    return true
                }
                if (element.subjectLongClick) {
                    setTimeout(() => {
                        if (this.#lastDown > this.#lastUp) {
                            const diff = (new Date()).getTime() - this.#lastDown
                            if (diff >= 500) {
                                element.subjectLongClick(event)
                            }
                        }
                    }, 500)
                    return true
                }
                break
            case 'pointermove':
                if (element.subjectPointerMove) {
                    element.subjectPointerMove(event)
                    return true
                }
                break
            case 'pointerenter':
                if (element.subjectPointerEnter) {
                    element.subjectPointerEnter(event)
                    return true
                }
                break
            case 'pointerleave':
                if (element.subjectPointerLeave) {
                    element.subjectPointerLeave(event)
                    return true
                }
                break
            case 'pointercancel':
                if (element.subjectPointerCancel) {
                    element.subjectPointerCancel(event)
                    return true
                }
                break
            default:
                break
        }
        return false
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