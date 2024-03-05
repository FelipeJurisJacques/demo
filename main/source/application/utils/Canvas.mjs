export class Canvas {

    /**
     * @var {HTMLCanvasElement}
     */
    #element

    /**
     * @var {HTMLElement}
     */
    #background

    /**
     * @param {HTMLCanvasElement|null} element 
     */
    constructor(element = null) {
        if (element) {
            this.#element = element
        } else {
            this.#element = document.createElement('canvas')
            this.#element.width = 100
            this.#element.height = 100
        }
    }

    get width() {
        return this.#element.width
    }

    get height() {
        return this.#element.height
    }

    /**
     * @returns {HTMLCanvasElement}
    */
    get element() {
        return this.#element
    }

    /**
     * @returns {Context2d}
     */
    context2d() {
        return new Context2d(this)
    }

    /**
     * @param {HTMLElement} to 
     * @returns {void}
     */
    background(to) {
        this.#background = to
        this.#element.width = to.offsetWidth
        this.#element.height = to.offsetHeight
    }

    render() {
        if (this.#background) {
            this.#background.style.backgroundImage = `url(${this.#element.toDataURL()})`
        }
    }
}

export class Context2d {

    /**
     * @var {Canvas}
     */
    #canvas

    /**
     * @var {CanvasRenderingContext2D}
     */
    #context

    /**
     * @param {Canvas} canvas 
     */
    constructor(canvas) {
        this.#canvas = canvas
        this.#context = canvas.element.getContext('2d')
    }

    get w() {
        return this.#canvas.width
    }

    get h() {
        return this.#canvas.height
    }

    get width() {
        return this.#canvas.width
    }

    get height() {
        return this.#canvas.height
    }

    set color(value) {
        this.#context.fillStyle = value
    }

    beginPath() {
        this.#context.beginPath()
        this.#canvas.render()
    }

    stroke() {
        this.#context.stroke()
        this.#canvas.render()
    }

    clear() {
        this.#context.clearRect(0, 0, this.w, this.h)
        this.#canvas.render()
    }

    test() {
        this.clear()
        this.#context.fillStyle = 'green'
        this.#context.fillRect(0, 0, this.w, this.h)
        this.#context.fillStyle = 'black'
        this.#context.moveTo(0, 0)
        this.#context.lineTo(this.w, this.h)
        this.#context.moveTo(0, this.h)
        this.#context.lineTo(this.w, 0)
        this.stroke()
    }
}