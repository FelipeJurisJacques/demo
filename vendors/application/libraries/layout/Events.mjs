export class Events {
    static #handlers = []
    static #subscriptions = []

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

    /**
     * @returns {Events[]}
     */
    static signed() {
        return this.#signed ? this.#signed : []
    }

    constructor() {
        if (!Events.#signed) {
            Events.#signed = []
        }
        Events.#signed.push(this)
    }

    get element() {
        return this.#element
    }

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
}