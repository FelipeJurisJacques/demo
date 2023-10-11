import { Random } from "../utils/Random.mjs"

class RoundLine {
    x
    y
    r
    stop
    start
    rotation

    /**
     * @var CanvasRenderingContext2D
     */
    #ctx

    constructor(ctx) {
        this.#ctx = ctx
        this.x = 0.0
        this.y = 0.0
        this.r = 0.0
        this.stop = 0.0
        this.start = 0.0
        this.rotation = 0.0
    }

    get circumference()
    {
        let stop = this.stop
        const start = this.start
        if (stop < start) {
            stop += Math.PI * 2
        }
        return stop - start
    }

    write() {
        if (this.rotation !== 0.0) {
            const circumference = Math.PI * 2
            this.stop += this.rotation
            this.start += this.rotation
            if (this.stop > circumference) {
                this.stop -= circumference
            }
            if (this.start > circumference) {
                this.start -= circumference
            }
        }
        const cos = Math.cos(this.start) * this.r
        const sin = Math.sin(this.start) * this.r
        this.#ctx.moveTo(this.x + cos, this.y + sin)
        this.#ctx.arc(this.x, this.y, this.r, this.start, this.stop)
    }
}

function rotation(element, ctx, lines) {
    setTimeout(() => {
        ctx.beginPath()
        ctx.clearRect(0, 0, element.width, element.height)
        for (let line of lines) {
            line.write()
        }
        ctx.stroke()
        rotation(element, ctx, lines)
    }, 24)
}
const element = document.body.querySelector('canvas#skin')
const ctx = element.getContext('2d')
ctx.lineWidth = 3
ctx.beginPath()
// ctx.moveTo(0, 0)
// ctx.lineTo(200, 100)
const rotate = Math.PI / 50
const circumference = Math.PI * 2
const lines = []
for (let i = 0; i < 10; i++) {
    let line = new RoundLine(ctx)
    line.x = element.width / 2
    line.y = element.height / 2
    let radius = Math.random() * 50
    radius += element.width / 2
    radius -= 50
    line.r = radius
    line.stop = 0.0
    line.start = 0.0
    while (line.circumference < 0.5 || line.circumference > Math.PI) {
        line.start = Math.random() * circumference
        line.stop = Math.random() * circumference
    }
    line.rotation = Random.between(rotate * -1, rotate)
    line.write()
    lines.push(line)
}
ctx.stroke()
rotation(element, ctx, lines)