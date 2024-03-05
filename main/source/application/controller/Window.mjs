export class Window {
    #tab

    constructor() {
        this.#tab = document.createElement('div')
        this.#tab.className = 'window'
    }
    
    get tab() {
        return this.#tab
    }
}