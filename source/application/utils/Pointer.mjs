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
    #out
    #over
    #enter
    #leave

    constructor(event) {
        Pointer.capture(event)
        this.#out = false
        this.#over = false
        this.#enter = false
        this.#leave = false
        switch (event.type) {
            case 'pointerout':
                this.#out = true
                break
            case 'pointerover':
                this.#over = true
                break
            case 'pointerenter':
                this.#enter = true
                break
            case 'pointerleave':
                this.#leave = true
                break
            default:
                break
        }
    }

    get x() {
        return Pointer.#x
    }

    get y() {
        return Pointer.#y
    }

    get up() {
        return Pointer.#up
    }

    get down() {
        return Pointer.#down
    }

    get move() {
        return Pointer.#move
    }

    get grab() {
        return Pointer.#grab
    }

    get touch() {
        return Pointer.#touch
    }

    get mouse() {
        return Pointer.#mouse
    }

    get click() {
        return Pointer.#click
    }

    get out() {
        return this.#out
    }

    get over() {
        return this.#over
    }

    get enter() {
        return this.#enter
    }

    get leave() {
        return this.#leave
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
        console.log(event.type)
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
            case 'pointerout':
            case 'pointerover':
                if (this.#grab) {
                    this.#grab = false
                }
                break
            default:
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