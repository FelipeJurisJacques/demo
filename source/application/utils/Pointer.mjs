export class Pointer {
    static #x = 0.0
    static #y = 0.0
    static #up = false
    static #down = false
    static #move = false
    static #grab = false
    static #touch = false
    static #mouse = false
    static #click = false

    static get x() {
        return this.#x
    }

    static get y() {
        return this.#y
    }

    static get up() {
        return this.#up
    }

    static get down() {
        return this.#down
    }

    static get move() {
        return this.#move
    }

    static get grab() {
        return this.#grab
    }

    static get touch() {
        return this.#touch
    }

    static get mouse() {
        return this.#mouse
    }

    static get click() {
        return this.#click
    }

    static capture(event) {
        if (event.clientX && event.clientY) {
            this.#x = event.clientX
            this.#y = event.clientY
        }
        if (event.pointerType) {
            switch (event.pointerType) {
                case 'touch':
                    if (!this.#touch) {
                        this.#mouse = false
                        this.#touch = true
                    }
                    break
                case 'mouse':
                default:
                    if (!this.#mouse) {
                        this.#mouse = true
                        this.#touch = false
                    }
                    break
            }
        }
        switch (event.type) {
            case 'click':
                if (!this.#click) {
                    this.#up = false
                    this.#down = false
                    this.#click = true
                }
                if (this.#grab || this.#move) {
                    this.#move = false
                    this.#grab = false
                }
                break
            case 'pointerup':
                if (!this.#up) {
                    this.#up = true
                    this.#down = false
                    this.#click = false
                }
                if (this.#grab) {
                    this.#grab = false
                }
                break
            case 'pointerdown':
                if (!this.#down) {
                    this.#up = false
                    this.#down = true
                    this.#click = false
                }
                if (this.#grab) {
                    this.#grab = false
                }
                break
            case 'pointermove':
                if (!this.#move) {
                    this.#move = true
                }
                if (this.#click) {
                    this.#click = false
                }
                if (this.#down && !this.#grab) {
                    this.#grab = true
                }
                break
            default:
                console.log(event.type)
                if (this.#grab || this.#move) {
                    this.#grab = false
                    this.#move = false
                }
                if (!this.#up || this.#down || this.#click) {
                    this.#up = true
                    this.#down = false
                    this.#click = false
                }
                break
        }
        if (event.buttons && event.buttons === 0) {
            if (!this.#up || this.#down || this.#grab || this.#click) {
                this.#up = true
                this.#down = false
                this.#grab = false
                this.#click = false
            }
        }
    }
}