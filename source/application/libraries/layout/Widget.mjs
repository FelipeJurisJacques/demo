import { Subject } from "../observer/Subject.mjs"

export class Widget extends Subject {

    #element

    constructor(context) {
        super()
        this.#element = context.tag
        if (this.#element) {
            for (let name in context) {
                switch (name) {
                    case 'tag':
                        break
                    case 'id':
                    case 'src':
                    case 'type':
                    case 'width':
                    case 'height':
                        this.#element[name] = context[name]
                        break
                    case 'class':
                        if (Array.isArray(context.class)) {
                            this.#element.className = context.class.join(' ')
                        } else {
                            this.#element.className = context.class
                        }
                        break
                    case 'controls':
                    case 'multiple':
                        this.#element[name] = context[name] ? true : false
                        break
                    case 'directory':
                        this.#element.directory = context.directory ? true : false
                        this.#element.webkitdirectory = context.directory ? true : false
                        break
                    case 'content':
                        this.#element.innerText = context.content
                        break
                    // case 'child':
                    //     if (typeof widget.child === 'object') {
                    //         this.#append(element, widget.child)
                    //     } else {
                    //         element.innerHTML = widget.child
                    //     }
                    //     break
                    case 'children':
                        for (let child of this.#element.children) {
                            child.remove()
                        }
                        for (let child of context.children) {
                            if (child instanceof Widget) {
                                this.#element.appendChild(child.#element)
                            } else {
                                this.#element.appendChild(child)
                            }
                        }
                        break
                    case 'style':
                        for (let style in context.style) {
                            let value = context.style[style]
                            if (typeof value === 'object') {
                                if (value instanceof URL) {
                                    value = `url(${value}), auto`
                                } else {
                                    value = value.toString()
                                }
                            } else if (typeof value === 'number') {
                                value = CSS.px(value)
                            }
                            this.#element.style[style] = context.style[style] = value
                        }
                        break
                    // case 'onAction':
                    //     this.#subscribe('click')
                    //     element.subjectAction = widget[name]
                    //     break
                    // case 'onLongAction':
                    //     this.#subscribe('pointerup')
                    //     this.#subscribe('pointerdown')
                    //     element.subjectLongAction = widget[name]
                    //     break
                    // case 'onDoubleAction':
                    //     this.#subscribe('click')
                    //     element.subjectDoubleAction = widget[name]
                    //     break
                    // case 'onTap':
                    //     this.#subscribe('click')
                    //     element.subjectTap = widget[name]
                    //     break
                    // case 'onLongTap':
                    //     this.#subscribe('pointerup')
                    //     this.#subscribe('pointerdown')
                    //     element.subjectLongTap = widget[name]
                    //     break
                    // case 'onDoubleTap':
                    //     this.#subscribe('click')
                    //     element.subjectDoubleClick = widget[name]
                    //     break
                    // case 'onClick':
                    //     this.#subscribe('click')
                    //     element.subjectClick = widget[name]
                    //     break
                    // case 'onLongClick':
                    //     this.#subscribe('pointerup')
                    //     this.#subscribe('pointerdown')
                    //     element.subjectLongClick = widget[name]
                    //     break
                    // case 'onDoubleClick':
                    //     this.#subscribe('click')
                    //     element.subjectDoubleClick = widget[name]
                    //     break
                    // case 'onPointerUp':
                    //     this.#subscribe('pointerup')
                    //     element.subjectPointerUp = widget[name]
                    //     break
                    // case 'onPointerOut':
                    //     this.#subscribe('pointerout')
                    //     element.subjectPointerOut = widget[name]
                    //     break
                    // case 'onPointerOver':
                    //     this.#subscribe('pointerover')
                    //     element.subjectPointerOver = widget[name]
                    //     break
                    // case 'onPointerDown':
                    //     this.#subscribe('pointerdown')
                    //     element.subjectPointerDown = widget[name]
                    //     break
                    // case 'onPointerMove':
                    //     this.#subscribe('pointermove')
                    //     element.subjectPointerMove = widget[name]
                    //     break
                    // case 'onPointerEnter':
                    //     this.#subscribe('pointerenter')
                    //     element.subjectPointerEnter = widget[name]
                    //     break
                    // case 'onPointerLeave':
                    //     this.#subscribe('pointerleave')
                    //     element.subjectPointerLeave = widget[name]
                    //     break
                    // case 'onPointerCancel':
                    //     this.#subscribe('pointercancel')
                    //     element.subjectPointerCancel = widget[name]
                    //     break
                    // case 'gotpointercapture':
                    //     this.#subscribe('gotpointercapture')
                    //     element.subjectgotpointercapture = widget[name]
                    //     break
                    // case 'lostpointercapture':
                    //     this.#subscribe('lostpointercapture')
                    //     element.subjectlostpointercapture = widget[name]
                    //     break

                    // ARRASTAR
                    // case 'onDragOver':
                    //     this.#subscribe('dragover')
                    //     element.subjectDragOver = widget[name]
                    //     break
                    // case 'onDrop':
                    //     this.#subscribe('drop')
                    //     element.subjectDrop = widget[name]
                    //     break
                    // case 'onDropFile':
                    //     this.#subscribe('drop')
                    //     this.#subscribe('dragover')
                    //     element.onDropFile = widget[name]
                    //     break

                    default:
                        this.#element.setAttribute(name, context[name])
                        break
                }
            }
        }
    }

    toString() {
        return this.#element
    }
}