export class Events {
    static #handlers
    static #subscriptions

    /**
     * @var {self[]}
     */
    static #signed

    #element
    #subject
    #subjects

    #subjectLeaving
    #subjectAccessed
    //focus
    //focusin
    #subjectTap
    #subjectBlur
    #subjectDrop
    #subjectClick
    #subjectActive
    #subjectLongTap
    #subjectDragOver
    #subjectLongClick
    #subjectDoubleTap
    #subjectPointerUp
    #subjectLongAction
    #subjectPointerOut
    #subjectDoubleClick
    #subjectPointerOver
    #subjectPointerDown
    #subjectPointerMove
    #subjectDoubleAction
    #subjectPointerEnter
    #subjectPointerLeave
    #subjectPointerCancel
    #subjectGotPointerCapture
    #subjectLostPointerCapture

    static #subscribe(observer) {
        if (!this.handlers) {
            this.handlers = []
        }
        this.handlers.push(observer)
    }

    static #unsubscribe(observer) {
        if (this.handlers) {
            for (let i in this.handlers) {
                if (this.handlers[i] === observer) {
                    this.handlers.splice(i, 1)
                }
            }
        }
    }

    static #notify(data) {
        if (this.handlers) {
            for (let handler of this.handlers) {
                // if (typeof handler === 'object' && handler instanceof Observer) {
                //     handler.notify(data, this)
                // } else if (typeof handler === 'function') {
                handler(data)
                // }
            }
        }
    }

    /**
     * @returns {Events[]}
     */
    static signed() { return this.#signed ? this.#signed : [] }

    /**
     * @param {HTMLElement} element 
     * @param {Object} context 
     * @returns {Events}
     */
    static build(element, context) {
        const events = new Events(element)
        for (let name in context) {
            events[name] = context
        }
        return events
    }

    /**
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.#element = element
        if (!Events.#signed) {
            Events.#signed = []
        }
        Events.#signed.push(this)
    }

    /**
     * @returns {HTMLElement}
     */
    get element() { return this.#element }

    /**
     * @returns {void}
     */
    deconstruct() {
        for (let i in Events.#signed) {
            if (Events.#signed[i] === this.#element) {
                Events.#signed.splice(i, 1)
                break
            }
        }
        this.#element = null
        this.#subject = null
        this.#subjects = null
        this.#subjectLeaving = null
        this.#subjectAccessed = null
    }

    // case 'onBlur':
    //     case 'onActive':
    //     case 'onLeaving':
    //     case 'onAccessed':
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



    // #subscribe(name, event) {
    //     if (!this.#subjects) {
    //         this.#subjects = {}
    //     }
    //     if (event) {
    //         this.#subjects[name] = event
    //     }
    //     if (Widget.#subscriptions.indexOf(name) < 0) {
    //         window.addEventListener(name, event => {
    //             Widget.#notify(event)
    //         })
    //         Widget.#subscriptions.push(name)
    //     }
    //     if (!Widget.#handlers.includes(this)) {
    //         Widget.#handlers.push(this)
    //     }
    // }

    // static #notify(event) {
    //     let element
    //     if (event.type === 'click') {
    //         for (let statement of this.#handlers) {
    //             if (statement.#access) {
    //                 if (statement.#subjectAccessed || statement.#subjectLeaving) {
    //                     let execute = true
    //                     element = event.target
    //                     while (element && execute) {
    //                         if (element === statement.#element) {
    //                             execute = false
    //                         } else {
    //                             element = element.parentElement
    //                         }
    //                     }
    //                     if (execute) {
    //                         statement.#access = false
    //                         if (statement.#subjectLeaving) {
    //                             statement.#subjectLeaving(event)
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     element = event.target
    //     while (element) {
    //         for (let statement of this.#handlers) {
    //             if (
    //                 statement.#subjects
    //                 && element === statement.#element
    //             ) {
    //                 switch (event.type) {
    //                     case 'focus':
    //                     case 'click':
    //                     case 'dbclick':
    //                         if (!statement.#access) {
    //                             if (statement.#subjectAccessed || statement.#subjectLeaving) {
    //                                 statement.#access = true
    //                                 if (statement.#subjectAccessed) {
    //                                     statement.#subjectAccessed(event)
    //                                 }
    //                             }
    //                         }
    //                         break
    //                     default:
    //                         break
    //                 }
    //             }
    //         }
    //         element = element.parentElement
    //     }
    //     element = event.target
    //     while (element) {
    //         for (let statement of this.#handlers) {
    //             if (
    //                 statement.#subjects
    //                 && element === statement.#element
    //             ) {
    //                 switch (event.type) {
    //                     case 'click':
    //                         if (statement.#subjectAccessed) {
    //                             statement.#subjectAccessed(event)
    //                         }
    //                         if (statement.#subjects.active) {
    //                             statement.#subject = statement.#subjects.active
    //                             statement.#subject(event)
    //                             return true
    //                         }
    //                         switch (event.pointerType) {
    //                             case 'mouse':
    //                                 if (statement.#subjects.click) {
    //                                     statement.#subject = statement.#subjects.click
    //                                     statement.#subject(event)
    //                                     return true
    //                                 }
    //                                 break
    //                             // case 'touch':
    //                             //     if (double && statement.#subjectDoubleTap) {
    //                             //         statement.#subjectDoubleTap(event)
    //                             //         return true
    //                             //     }
    //                             //     if (statement.#subjectTap) {
    //                             //         statement.#subjectTap(event)
    //                             //         return true
    //                             //     }
    //                             //     break
    //                             default:
    //                                 break
    //                         }
    //                         break
    //                     // case 'pointerup':
    //                     //     if (statement.#subjectPointerUp) {
    //                     //         statement.#subjectPointerUp(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointerout':
    //                     //     if (statement.#subjectPointerOut) {
    //                     //         statement.#subjectPointerOut(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointerover':
    //                     //     if (statement.#subjectPointerOver) {
    //                     //         statement.#subjectPointerOver(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointerdown':
    //                     //     if (statement.#subjectPointerDown) {
    //                     //         statement.#subjectPointerDown(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointermove':
    //                     //     if (statement.#subjectPointerMove) {
    //                     //         statement.#subjectPointerMove(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointerenter':
    //                     //     if (statement.#subjectPointerEnter) {
    //                     //         statement.#subjectPointerEnter(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointerleave':
    //                     //     if (statement.#subjectPointerLeave) {
    //                     //         statement.#subjectPointerLeave(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'pointercancel':
    //                     //     if (statement.#subjectPointerCancel) {
    //                     //         statement.#subjectPointerCancel(event)
    //                     //         return true
    //                     //     }
    //                     //     break

    //                     // // ARRASTAR
    //                     // case 'dragover':
    //                     //     if (element.onDropFile) {
    //                     //         event.preventDefault()
    //                     //     }
    //                     //     if (statement.#subjectDragOver) {
    //                     //         statement.#subjectDragOver(event)
    //                     //         return true
    //                     //     }
    //                     //     break
    //                     // case 'drop':
    //                     //     if (element.onDropFile) {
    //                     //         event.preventDefault()
    //                     //         event.files = File.files(event.dataTransfer)
    //                     //         element.onDropFile(event)
    //                     //         return true
    //                     //     }
    //                     //     if (statement.#subjectDrop) {
    //                     //         statement.#subjectDrop(event)
    //                     //         return true
    //                     //     }
    //                     //     break

    //                     default:
    //                         if (statement.#subjects[event.type]) {
    //                             statement.#subject = statement.#subjects[event.type]
    //                             statement.#subject(event)
    //                             return true
    //                         }
    //                         break
    //                 }
    //             }
    //         }
    //         element = element.parentElement
    //     }
    // }

    /**
     * @param {function} event
     */
    set onActive(event) {
        this.#sign('click')
        this.#subjectActive = event
    }

    /**
     * @param {function} event
     */
    set onAccessed(event) {
        // this.#subscribe('click')
    }

    /**
     * @param {function} event
     */
    set onLeaving(event) {
        // this.#subscribe('click')
    }

    /**
     * @param {function} event
     */
    // set onBlur(event) {
    //     if (!this.#subjects) {
    //         this.#subjects = {}
    //     }
    //     if (!this.#subjects.blur) {
    //         if (this.#element.getAttribute('tabindex') === null) {
    //             this.#element.setAttribute('tabindex', 0)
    //         }
    //         this.#element.addEventListener('blur', event => {
    //             this.#subjects.blur(event)
    //         })
    //     }
    //     this.#subjects.blur = event
    // }

    #sign(name) {
        if (!Events.#subscriptions) {
            Events.#subscriptions = []
        }
        if (Events.#subscriptions.indexOf(name) === -1) {
            window.addEventListener(name, Events.#notify)
            Events.#subscriptions.push(name)
        }
    }
}