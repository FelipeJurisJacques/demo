export class Style {
    #element

    static build(element, context) {
        const style = new Style(element)
        for (let i in context) {
            style[i] = context[i]
        }
        style.deconstruct()
    }

    constructor(element) { this.#element = element }

    deconstruct() { this.#element = null }

    set grid(context) {
        this.#addClass('grid')
        if (context.columns) {
            this.#addClass(`grid-columns-${context.columns}`)
        }
        if (context.template && context.template.rows) {
            this.#element.style.gridTemplateRows = context.template.rows.join(' ')
        }
        if (context.template && context.template.columns) {
            this.#element.style.gridTemplateColumns = context.template.columns.join(' ')
        }
    }

    /**
     * @see 0 horizontal
     * @see 1 vertical
     * @param {int} value 
     */
    set orientation(value) {
        if (value === 0) {
            switch (this.#element.tagName) {
                case 'UL':
                    this.#addClass('orientation-inline')
                    break
                default:
                    break
            }
        }
    }

    #addClass(name) {
        if (!this.#element.classList.contains(name)) {
            this.#element.classList.add(name)
        }
    }
}