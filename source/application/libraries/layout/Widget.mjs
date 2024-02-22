export class Widget {
    static #handlers = []
    static #subscriptions = []

    /**
     * @var {boolean}
     */
    #access

    #element
    #subject
    #subjects

    #subjectLeaving
    #subjectAccessed
    //focus
    //focusin
    // #subjectTap
    // #subjectBlur
    // #subjectDrop
    // #subjectClick
    // #subjectActive
    // #subjectLongTap
    // #subjectDragOver
    // #subjectLongClick
    // #subjectDoubleTap
    // #subjectPointerUp
    // #subjectLongAction
    // #subjectPointerOut
    // #subjectDoubleClick
    // #subjectPointerOver
    // #subjectPointerDown
    // #subjectPointerMove
    // #subjectDoubleAction
    // #subjectPointerEnter
    // #subjectPointerLeave
    // #subjectPointerCancel
    // #subjectGotPointerCapture
    // #subjectLostPointerCapture

    constructor(context) {
        this.#element = context.tag
        this.#element.widget = this
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
                    case 'child':
                        if (context.child instanceof Widget) {
                            this.#element.appendChild(context.child.#element)
                        } else if (context.child instanceof URL) {
                            fetch(context.child).then(async response => {
                                this.#element.innerHTML = await response.text()
                            })
                        } else {
                            this.#element.appendChild(context.child)
                        }
                        break
                    case 'children':
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
                    case 'onBlur':
                    case 'onActive':
                    case 'onLeaving':
                    case 'onAccessed':
                        this[name] = context[name]
                        break
                    // case 'onLongAction':
                    //     this.#subscribe('pointerup')
                    //     this.#subscribe('pointerdown')
                    //     this.#subjectLongAction = widget[name]
                    //     break
                    // case 'onDoubleAction':
                    //     this.#subscribe('click')
                    //     this.#subjectDoubleAction = widget[name]
                    //     break
                    // case 'onTap':
                    //     this.#subscribe('click')
                    //     this.#subjectTap = widget[name]
                    //     break
                    // case 'onLongTap':
                    //     this.#subscribe('pointerup')
                    //     this.#subscribe('pointerdown')
                    //     this.#subjectLongTap = widget[name]
                    //     break
                    // case 'onDoubleTap':
                    //     this.#subscribe('click')
                    //     this.#subjectDoubleClick = widget[name]
                    //     break
                    // case 'onClick':
                    //     this.#subscribe('click')
                    //     this.#subjectClick = widget[name]
                    //     break
                    // case 'onLongClick':
                    //     this.#subscribe('pointerup')
                    //     this.#subscribe('pointerdown')
                    //     this.#subjectLongClick = widget[name]
                    //     break
                    // case 'onDoubleClick':
                    //     this.#subscribe('click')
                    //     this.#subjectDoubleClick = widget[name]
                    //     break
                    // case 'onPointerUp':
                    //     this.#subscribe('pointerup')
                    //     this.#subjectPointerUp = widget[name]
                    //     break
                    // case 'onPointerOut':
                    //     this.#subscribe('pointerout')
                    //     this.#subjectPointerOut = widget[name]
                    //     break
                    // case 'onPointerOver':
                    //     this.#subscribe('pointerover')
                    //     this.#subjectPointerOver = widget[name]
                    //     break
                    // case 'onPointerDown':
                    //     this.#subscribe('pointerdown')
                    //     this.#subjectPointerDown = widget[name]
                    //     break
                    // case 'onPointerMove':
                    //     this.#subscribe('pointermove')
                    //     this.#subjectPointerMove = widget[name]
                    //     break
                    // case 'onPointerEnter':
                    //     this.#subscribe('pointerenter')
                    //     this.#subjectPointerEnter = widget[name]
                    //     break
                    // case 'onPointerLeave':
                    //     this.#subscribe('pointerleave')
                    //     this.#subjectPointerLeave = widget[name]
                    //     break
                    // case 'onPointerCancel':
                    //     this.#subscribe('pointercancel')
                    //     this.#subjectPointerCancel = widget[name]
                    //     break
                    // case 'gotpointercapture':
                    //     this.#subscribe('gotpointercapture')
                    //     this.#subjectgotpointercapture = widget[name]
                    //     break
                    // case 'lostpointercapture':
                    //     this.#subscribe('lostpointercapture')
                    //     this.#subjectlostpointercapture = widget[name]
                    //     break

                    // ARRASTAR
                    // case 'onDragOver':
                    //     this.#subscribe('dragover')
                    //     this.#subjectDragOver = widget[name]
                    //     break
                    // case 'onDrop':
                    //     this.#subscribe('drop')
                    //     this.#subjectDrop = widget[name]
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

    deconstruct() {
        if (this.#element) {
            delete this.#element.widget
            this.#element.remove()
        }
        this.#access = null
        this.#element = null
        this.#subject = null
        this.#subjects = null
        this.#subjectLeaving = null
        this.#subjectAccessed = null
    }

    /**
     * @var {boolean} value
     */
    set toggle(value) {
        this.#element.style.display = value ? 'block' : 'none'
        this.#access = value
    }

    /**
     * @returns {boolean}
     */
    get toggle() {
        if (this.#element.style.display) {
            return this.#element.style.display !== 'none'
        } else {
            window.getComputedStyle(this.#element).display !== 'none'
        }
    }

    /**
     * @param {object} context
     */
    set child(context) {
        for (let child of this.#element.children) {
            child.remove()
        }
        if (context instanceof Widget) {
            this.#element.append(context.#element)
        } else if (context instanceof URL) {
            fetch(context).then(async response => {
                this.#element.innerHTML = await response.text()
            })
        } else {
            this.#element.append(context)
        }
    }

    get children() {
        return this.#element.children
    }

    set children(list) {
        for (let child of this.#element.children) {
            child.remove()
        }
        for (let child of list) {
            if (child instanceof Widget) {
                this.#element.append(child.#element)
            } else {
                this.#element.append(child)
            }
        }
    }

    set append(child) {
        if (child instanceof Widget) {
            this.#element.append(child.#element)
        } else {
            this.#element.append(child)
        }
    }

    /**
     * @param {function} event
     */
    set onActive(event) {
        this.#subscribe('click')
        this.#subjects.active = event
    }

    /**
     * @param {function} event
     */
    set onAccessed(event) {
        this.#subscribe('click')
        this.#subjectAccessed = event
    }

    /**
     * @param {function} event
     */
    set onLeaving(event) {
        this.#subscribe('click')
        this.#subjectLeaving = event
    }

    /**
     * @param {function} event
     */
    set onBlur(event) {
        if (!this.#subjects) {
            this.#subjects = {}
        }
        if (!this.#subjects.blur) {
            if (this.#element.getAttribute('tabindex') === null) {
                this.#element.setAttribute('tabindex', 0)
            }
            this.#element.addEventListener('blur', event => {
                this.#subjects.blur(event)
            })
        }
        this.#subjects.blur = event
    }

    focus(options) {
        this.#element.focus(options)
        this.#access = true
    }

    /**
     * @param {string} search
     * @returns {Widget}
     */
    query(search) {
        const result = this.#element.querySelector(search)
        return result.widget ? result.widget : result.widget
    }

    remove() {
        this.deconstruct()
    }

    toString() {
        return this.#element
    }

    #subscribe(name, event) {
        if (!this.#subjects) {
            this.#subjects = {}
        }
        if (event) {
            this.#subjects[name] = event
        }
        if (Widget.#subscriptions.indexOf(name) < 0) {
            window.addEventListener(name, event => {
                Widget.#notify(event)
            })
            Widget.#subscriptions.push(name)
        }
        if (!Widget.#handlers.includes(this)) {
            Widget.#handlers.push(this)
        }
    }

    static #notify(event) {
        let element
        if (event.type === 'click') {
            for (let statement of this.#handlers) {
                if (statement.#access) {
                    if (statement.#subjectAccessed || statement.#subjectLeaving) {
                        let execute = true
                        element = event.target
                        while (element && execute) {
                            if (element === statement.#element) {
                                execute = false
                            } else {
                                element = element.parentElement
                            }
                        }
                        if (execute) {
                            statement.#access = false
                            if (statement.#subjectLeaving) {
                                statement.#subjectLeaving(event)
                            }
                        }
                    }
                }
            }
        }
        element = event.target
        while (element) {
            for (let statement of this.#handlers) {
                if (
                    statement.#subjects
                    && element === statement.#element
                ) {
                    switch (event.type) {
                        case 'focus':
                        case 'click':
                        case 'dbclick':
                            if (!statement.#access) {
                                if (statement.#subjectAccessed || statement.#subjectLeaving) {
                                    statement.#access = true
                                    if (statement.#subjectAccessed) {
                                        statement.#subjectAccessed(event)
                                    }
                                }
                            }
                            break
                        default:
                            break
                    }
                }
            }
            element = element.parentElement
        }
        element = event.target
        while (element) {
            for (let statement of this.#handlers) {
                if (
                    statement.#subjects
                    && element === statement.#element
                ) {
                    switch (event.type) {
                        case 'click':
                            if (statement.#subjectAccessed) {
                                statement.#subjectAccessed(event)
                            }
                            if (statement.#subjects.active) {
                                statement.#subject = statement.#subjects.active
                                statement.#subject(event)
                                return true
                            }
                            switch (event.pointerType) {
                                case 'mouse':
                                    if (statement.#subjects.click) {
                                        statement.#subject = statement.#subjects.click
                                        statement.#subject(event)
                                        return true
                                    }
                                    break
                                // case 'touch':
                                //     if (double && statement.#subjectDoubleTap) {
                                //         statement.#subjectDoubleTap(event)
                                //         return true
                                //     }
                                //     if (statement.#subjectTap) {
                                //         statement.#subjectTap(event)
                                //         return true
                                //     }
                                //     break
                                default:
                                    break
                            }
                            break
                        // case 'pointerup':
                        //     if (statement.#subjectPointerUp) {
                        //         statement.#subjectPointerUp(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointerout':
                        //     if (statement.#subjectPointerOut) {
                        //         statement.#subjectPointerOut(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointerover':
                        //     if (statement.#subjectPointerOver) {
                        //         statement.#subjectPointerOver(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointerdown':
                        //     if (statement.#subjectPointerDown) {
                        //         statement.#subjectPointerDown(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointermove':
                        //     if (statement.#subjectPointerMove) {
                        //         statement.#subjectPointerMove(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointerenter':
                        //     if (statement.#subjectPointerEnter) {
                        //         statement.#subjectPointerEnter(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointerleave':
                        //     if (statement.#subjectPointerLeave) {
                        //         statement.#subjectPointerLeave(event)
                        //         return true
                        //     }
                        //     break
                        // case 'pointercancel':
                        //     if (statement.#subjectPointerCancel) {
                        //         statement.#subjectPointerCancel(event)
                        //         return true
                        //     }
                        //     break

                        // // ARRASTAR
                        // case 'dragover':
                        //     if (element.onDropFile) {
                        //         event.preventDefault()
                        //     }
                        //     if (statement.#subjectDragOver) {
                        //         statement.#subjectDragOver(event)
                        //         return true
                        //     }
                        //     break
                        // case 'drop':
                        //     if (element.onDropFile) {
                        //         event.preventDefault()
                        //         event.files = File.files(event.dataTransfer)
                        //         element.onDropFile(event)
                        //         return true
                        //     }
                        //     if (statement.#subjectDrop) {
                        //         statement.#subjectDrop(event)
                        //         return true
                        //     }
                        //     break

                        default:
                            if (statement.#subjects[event.type]) {
                                statement.#subject = statement.#subjects[event.type]
                                statement.#subject(event)
                                return true
                            }
                            break
                    }
                }
            }
            element = element.parentElement
        }
    }
}