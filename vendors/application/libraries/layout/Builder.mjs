import { Style } from "./Style.mjs"
import { Events } from "./Events.mjs"
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

    /**
     * @param {Object} context 
     * @returns {HTMLElement}
     */
    static build(context) {
        let events = false
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
                    element.className = typeof context.class === 'string' ? context.class : context.join(' ')
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
                default:
                    if (name.substring(0, 2) === 'on') {
                        events = true
                    } else {
                        element.setAttribute(name, context[name])
                    }
                    break
            }
        }
        if (events) {
            Events.build(element, context)
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