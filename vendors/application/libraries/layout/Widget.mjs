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

    constructor(context) { this.#element = Builder.build(context) }

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

    set class(value) { this.#element.className = typeof value === 'string' ? value : value.join(' ') }

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
    set toggle(value) { this.#element.style.display = value ? 'block' : 'none' }

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

    get children() { return this.#element.children }

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

    focus(options) { this.#element.focus(options) }

    /**
     * @param {string} search
     * @returns {Widget}
     */
    query(search) {
        const result = this.#element.querySelector(search)
        return result.widget ? result.widget : result.widget
    }

    set onAction(event) { this.#getEvents().onAction = event }

    remove() { this.deconstruct() }

    toString() { return this.#element }

    /**
     * @returns {Events}
     */
    #getEvents() {
        if (!this.#events) {
            for (let events of Events.signed()) {
                if (events.element === this.#element) {
                    this.#events = events
                    break
                }
            }
        }
        return this.#events
    }
}