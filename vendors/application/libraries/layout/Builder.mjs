import { Events } from "./Events.mjs"
import { Style } from "./Style.mjs"
import { Widget } from "./Widget.mjs"

export class Builder {

    static children(element, list) {
        for (let child of element.children) {
            child.remove()
        }
        for (let child of list) {
            element.append(child)
        }
    }

    static style(element, context) {
        if (context.grid) {
            this.#addClass(element, 'grid')
            if (context.grid.columns) {
                this.#addClass(element, `grid-columns-${context.grid.columns}`)
            }
            if (context.grid.template && context.grid.template.rows) {
                element.element.style.gridTemplateRows = context.grid.template.rows.join(' ')
            }
            if (context.grid.template && context.grid.template.columns) {
                element.element.style.gridTemplateColumns = context.grid.template.columns.join(' ')
            }
        }
        if (context.orientation) {
            switch (this.element.tagName) {
                case 'UL':
                    if (context.orientation === 0) {
                        this.#addClass(element, 'orientation-inline')
                    }
                    break
                default:
                    break
            }
        }
    }

    static build(context) {
        const element = typeof context.tag === 'string' ? window.document.createElement(context.tag) : context.tag
        for (let name in context) {
            switch (name) {
                case 'tag':
                    break
                case 'id':
                case 'src':
                case 'type':
                case 'width':
                case 'height':
                    element[name] = context[name]
                    break
                case 'child':
                    this.#clearChildren(element)
                    this.#appendChild(element, context.child)
                    break
                case 'class':
                    if (typeof context.class === 'string') {
                        element.className = context.class
                    }
                    if (Array.isArray(context.class)) {
                        element.className = context.join(' ')
                    }
                    break
                case 'style':
                    Style.build(element, context.style)
                    break
                case 'children':
                    this.#clearChildren(element)
                    for (let child of context.children) {
                        this.#appendChild(element, child)
                    }
                    break
                case 'controls':
                case 'multiple':
                    element[name] = context[name] ? true : false
                    break
                case 'directory':
                    element.directory = context.directory ? true : false
                    element.webkitdirectory = context.directory ? true : false
                    break
                case 'content':
                    element.innerText = context.content
                    break
                case 'onBlur':
                case 'onActive':
                case 'onLeaving':
                case 'onAccessed':
                    // this[name] = context[name]
                    break
                // case 'onLongAction':
                //     element.subscribe('pointerup')
                //     element.subscribe('pointerdown')
                //     element.subjectLongAction = widget[name]
                //     break
                // case 'onDoubleAction':
                //     element.subscribe('click')
                //     element.subjectDoubleAction = widget[name]
                //     break
                // case 'onTap':
                //     element.subscribe('click')
                //     element.subjectTap = widget[name]
                //     break
                // case 'onLongTap':
                //     element.subscribe('pointerup')
                //     element.subscribe('pointerdown')
                //     element.subjectLongTap = widget[name]
                //     break
                // case 'onDoubleTap':
                //     element.subscribe('click')
                //     element.subjectDoubleClick = widget[name]
                //     break
                // case 'onClick':
                //     element.subscribe('click')
                //     element.subjectClick = widget[name]
                //     break
                // case 'onLongClick':
                //     element.subscribe('pointerup')
                //     element.subscribe('pointerdown')
                //     element.subjectLongClick = widget[name]
                //     break
                // case 'onDoubleClick':
                //     element.subscribe('click')
                //     element.subjectDoubleClick = widget[name]
                //     break
                // case 'onPointerUp':
                //     element.subscribe('pointerup')
                //     element.subjectPointerUp = widget[name]
                //     break
                // case 'onPointerOut':
                //     element.subscribe('pointerout')
                //     element.subjectPointerOut = widget[name]
                //     break
                // case 'onPointerOver':
                //     element.subscribe('pointerover')
                //     element.subjectPointerOver = widget[name]
                //     break
                // case 'onPointerDown':
                //     element.subscribe('pointerdown')
                //     element.subjectPointerDown = widget[name]
                //     break
                // case 'onPointerMove':
                //     element.subscribe('pointermove')
                //     element.subjectPointerMove = widget[name]
                //     break
                // case 'onPointerEnter':
                //     element.subscribe('pointerenter')
                //     element.subjectPointerEnter = widget[name]
                //     break
                // case 'onPointerLeave':
                //     element.subscribe('pointerleave')
                //     element.subjectPointerLeave = widget[name]
                //     break
                // case 'onPointerCancel':
                //     element.subscribe('pointercancel')
                //     element.subjectPointerCancel = widget[name]
                //     break
                // case 'gotpointercapture':
                //     element.subscribe('gotpointercapture')
                //     element.subjectgotpointercapture = widget[name]
                //     break
                // case 'lostpointercapture':
                //     element.subscribe('lostpointercapture')
                //     element.subjectlostpointercapture = widget[name]
                //     break

                // ARRASTAR
                // case 'onDragOver':
                //     element.subscribe('dragover')
                //     element.subjectDragOver = widget[name]
                //     break
                // case 'onDrop':
                //     element.subscribe('drop')
                //     element.subjectDrop = widget[name]
                //     break
                // case 'onDropFile':
                //     element.subscribe('drop')
                //     element.subscribe('dragover')
                //     element.onDropFile = widget[name]
                //     break

                default:
                    element.setAttribute(name, context[name])
                    break
            }
        }
        return element
    }

    static #addClass(element, value) {
        if (!element.classList.contains(value)) {
            element.classList.add(value)
        }
    }

    static #clearChildren(element) {
        for (let e of element.children) {
            e.remove()
            for (let events of Events.signed()) {
                if (events.element === e) {
                    events.deconstruct()
                    events = null
                    break
                }
            }
        }
    }

    static #appendChild(element, child) {
        if (child instanceof Widget) {
            element.append(child.element)
        } else if (
            child instanceof HTMLElement
            || child instanceof SVGElement
        ) {
            element.append(child)
        } else if (child instanceof URL) {
            fetch(child).then(async response => {
                element.innerHTML = await response.text()
            })
        } else if (child instanceof Object) {
            element.append(this.build(child))
        }
    }
}