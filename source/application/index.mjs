import { } from "./kernels/Base.mjs"
import { Bar } from "./widget/Bar.mjs"
import { Builder } from "./utils/Builder.mjs"

Builder.body({
    children: [
        Bar(),
    ],
})