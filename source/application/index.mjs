import { } from "./kernels/Base.mjs"
import { } from "./controller/Skin.mjs"
import { Canvas } from "./utils/Canvas.mjs"

const player = document.body.querySelector('button')
player.subscribe(event => {
    if (event.type === 'click') {
        const frame = document.createElement('iframe')
        frame.setAttribute('frameborder', 0)
        frame.src = event.target.getAttribute('src')
        document.body.appendChild(frame)
    }
})

const canvas = new Canvas()
const footer = document.body.querySelector('footer')
canvas.background(footer)
const context = canvas.context2d()
context.test()
