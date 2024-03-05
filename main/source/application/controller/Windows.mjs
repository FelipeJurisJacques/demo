export class Windows {
    #tabs
    #element

    constructor(element) {
        this.#tabs = []
        this.#element = element
    }

    push(window) {
        this.#tabs.push(window)
        this.#element.appendChild(window.tab)
    }
}