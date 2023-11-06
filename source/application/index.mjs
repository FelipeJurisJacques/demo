import { } from "./kernels/Base.mjs"
import { Footer } from "./widget/Footer.mjs"

document.build({
    tag: 'body',
    children: [
        Footer(),
    ],
})