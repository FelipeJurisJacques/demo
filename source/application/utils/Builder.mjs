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
                case 'controls':
                    element[name] = widget[name] ? true : false
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
                case 'style':
                    for (let style in widget.style) {
                        let value = widget.style[style]
                        if (typeof value === 'object' && value instanceof URL) {
                            value = `url(${value}), auto`
                        }
                        element.style[style] = widget.style[style] = value
                    }
                    break
                case 'onAction':
                    this.#subscribe('click')
                    element.subjectAction = widget[name]
                    break
                case 'onLongAction':
                    this.#subscribe('pointerup')
                    this.#subscribe('pointerdown')
                    element.subjectLongAction = widget[name]
                    break
                case 'onDoubleAction':
                    this.#subscribe('click')
                    element.subjectDoubleAction = widget[name]
                    break
                case 'onTap':
                    this.#subscribe('click')
                    element.subjectTap = widget[name]
                    break
                case 'onLongTap':
                    this.#subscribe('pointerup')
                    this.#subscribe('pointerdown')
                    element.subjectLongTap = widget[name]
                    break
                case 'onDoubleTap':
                    this.#subscribe('click')
                    element.subjectDoubleClick = widget[name]
                    break
                case 'onClick':
                    this.#subscribe('click')
                    element.subjectClick = widget[name]
                    break
                case 'onLongClick':
                    this.#subscribe('pointerup')
                    this.#subscribe('pointerdown')
                    element.subjectLongClick = widget[name]
                    break
                case 'onDoubleClick':
                    this.#subscribe('click')
                    element.subjectDoubleClick = widget[name]
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
                const diff = (new Date()).getTime() - this.#lastClick
                const double = diff > 0 && diff < 200
                if (double && element.subjectDoubleAction) {
                    element.subjectDoubleAction(event)
                    return true
                }
                if (element.subjectAction) {
                    element.subjectAction(event)
                    return true
                }
                switch (event.pointerType) {
                    case 'mouse':
                        if (double && element.subjectDoubleClick) {
                            element.subjectDoubleClick(event)
                            return true
                        }
                        if (element.subjectClick) {
                            element.subjectClick(event)
                            return true
                        }
                        break
                    case 'touch':
                        if (double && element.subjectDoubleTap) {
                            element.subjectDoubleTap(event)
                            return true
                        }
                        if (element.subjectTap) {
                            element.subjectTap(event)
                            return true
                        }
                        break
                    default:
                        break
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
                if (
                    element.subjectLongAction
                    || (element.subjectLongTap && event.pointerType === 'touch')
                    || (element.subjectLongClick && event.pointerType === 'mouse')
                ) {
                    setTimeout(() => {
                        if (this.#lastDown > this.#lastUp) {
                            const diff = (new Date()).getTime() - this.#lastDown
                            if (diff >= 500) {
                                if (element.subjectLongAction) {
                                    element.subjectLongAction(event)
                                } else {
                                    switch (event.pointerType) {
                                        case 'mouse':
                                            if (element.subjectLongClick) {
                                                element.subjectLongClick(event)
                                                return true
                                            }
                                            break
                                        case 'touch':
                                            if (element.subjectTap) {
                                                element.subjectTap(event)
                                                return true
                                            }
                                            break
                                        default:
                                            break
                                    }
                                }
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