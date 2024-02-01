import { Bar } from "./widget/Bar.mjs"
import { Media } from "./widget/Media.mjs"
import { WebGl } from "./libraries/glsl/WebGl.mjs"
import { Builder } from "./libraries/builder/Builder.mjs"
import { Wavefront } from "./libraries/glsl/Wavefront.mjs"
import { ServiceWorker } from "./libraries/sw/ServiceWorker.mjs"

const url = new URL(`${location.origin}/source/application/worker/ServiceWorker.js`)
ServiceWorker.register(url)
// ServiceWorker.message.request('teste').then(response => {
//     console.log(response)
// })

// import { Recursive } from "./models/Recursive.mjs";
// console.log('testando...')
// ServiceWorker.message.request('teste 2').then(response => {
//     console.log(response)
// })
// Recursive.base().then(async data => {
//     data.variavel_1 = 'teste'
//     data.variavel_2 = 2
//     console.log(data)
// }).catch(event => {
//     console.error(event)
// })

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
    gl.push(new Wavefront(
        await WebGl.import(new URL(`${location.origin}/source/assets/wavefront/cube/cube.obj`))
    ))
    gl.render(
        await WebGl.import(new URL(`${location.origin}/source/shader/vertex.glsl`)),
        await WebGl.import(new URL(`${location.origin}/source/shader/fragment.glsl`))
    )
}

render(canvas)