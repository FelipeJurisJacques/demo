export class CSSMathSub {
    #values

    constructor(...args) {
        this.#values = args
    }

    get operator() {
        return 'sub'
    }

    get values() {
        return this.#values
    }

    toString() {
        return `calc(${this.#values.join(' - ')})`
    }
}

export class Vector {
    #x
    #y
    #z

    constructor(...args) {
        if (typeof args[0] === 'object') {
            args = args[0]
            if (args instanceof Vector) {
                this.#x = args.x
                this.#y = args.y
                this.#z = args.z
            } else {
                this.x = args[0]
                this.y = args[1]
                if (args.length > 2) {
                    this.z = args[2]
                }
            }
        } else {
            this.x = args[0]
            this.y = args[1]
            if (args.length > 2) {
                this.z = args[2]
            }
        }
    }

    set x(value) {
        this.#x = typeof value === 'number' ? CSS.px(value) : value
    }

    get x() {
        return this.#x
    }
    set y(value) {
        this.#y = typeof value === 'number' ? CSS.px(value) : value
    }

    get y() {
        return this.#y
    }
    set z(value) {
        this.#z = typeof value === 'number' ? CSS.px(value) : value
    }

    get z() {
        return this.#z
    }

    toString() {
        if (this.#z) {
            return `${this.#x} ${this.#y} ${this.#z}`
        }
        return `${this.#x} ${this.#y}`
    }
}

export function Sub(value1, value2) {
    if (typeof value1 === 'number') {
        value1 = CSS.px(value1)
    }
    if (typeof value2 === 'number') {
        value2 = CSS.px(value2)
    }
    return new CSSMathSub(value1, value2)
}

export function Sum(value1, value2) {
    if (typeof value1 === 'number') {
        value1 = CSS.px(value1)
    }
    if (typeof value2 === 'number') {
        value2 = CSS.px(value2)
    }
    return new CSSMathSum(value1, value2)
}

export function Path(list) {
    for (let i in list) {
        list[i] = new Vector(list[i])
    }
    if (list.length > 0) {
        return `polygon(${list.join(', ')})`
    }
    return ''
}

export function Translate(x, y) {
    if (typeof x === 'number') {
        x = CSS.px(x)
    }
    if (typeof y === 'number') {
        y = CSS.px(y)
    }
    return `translate(${x}, ${y})`
}