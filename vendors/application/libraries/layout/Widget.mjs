import { Style } from "./Style.mjs"
import { Events } from "./Events.mjs"
import { Builder } from "./Builder.mjs"

export class Widget {

    /**
     * @var {Events}
     */
    #events

    /**
     * @var {HTMLElement}
     */
    #element

    constructor(context) {
        this.#element = Builder.build(context)
        for (let events of Events.signed()) {
            if (events.element === this.#element) {
                this.#events = events
                break
            }
        }
    }

    deconstruct() {
        if (this.#element) {
            this.#element.remove()
        }
        this.#events = null
        this.#element = null
    }

    get element() { return this.#element }

    get id() { return this.#element.id }

    set id(value) { this.#element.id = value }

    get class() { return this.#element.classList }

    set class(value) {
        if (Array.isArray(value)) {
            this.#element.className = value.join(' ')
        } else {
            this.#element.className = value
        }
    }

    /**
     * @returns {Style}
     */
    get style() { return new Style(this.#element) }

    /**
     * @param {object} context
     */
    set style(context) { Style.build(this.#element, context) }

    /**
     * @var {boolean} value
     */
    set toggle(value) {
        this.#element.style.display = value ? 'block' : 'none'
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
        this.append = context
    }

    get children() {
        const list = []
        for (let child of this.#element.children) {
            if (child.widget) {
                list.push(child.widget)
            }
        }
        return list
    }

    set children(list) {
        for (let child of this.#element.children) {
            child.remove()
        }
        for (let child of list) {
            this.append = child
        }
    }

    set append(child) {
        if (child instanceof Widget) {
            this.#element.append(child.#element)
        } else if (
            child instanceof HTMLElement
            || child instanceof SVGElement
        ) {
            this.#element.append(child)
        } else if (child instanceof URL) {
            fetch(child).then(async response => {
                this.#element.innerHTML = await response.text()
            })
        } else if (child instanceof Object) {
            this.#element.append(Builder.build(child))
        }
    }

    /**
     * @param {function} event
     */
    set onActive(event) {
        // this.#subscribe('click')
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

    focus(options) {
        this.#element.focus(options)
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
}