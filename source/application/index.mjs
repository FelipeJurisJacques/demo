import { Bar } from "./widget/Bar.mjs"
import { Media } from "./widget/Media.mjs"
import { Builder } from "./utils/Builder.mjs"
import { WebGl } from "./libraries/glsl/WebGl.mjs"

const canvas = Builder.build({
    tag: 'canvas',
})

Builder.body({
    children: [
        Media(),
        Bar(),
        canvas,
    ],
})

async function render(canvas) {
    const gl = new WebGl(canvas)
    gl.render(
        await WebGl.import(new URL(`${location.origin}/source/shader/vertex.glsl`)),
        await WebGl.import(new URL(`${location.origin}/source/shader/fragment.glsl`))
    )
}

render(canvas)