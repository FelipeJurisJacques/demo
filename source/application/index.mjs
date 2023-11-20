import { Bar } from "./widget/Bar.mjs"
import { Media } from "./widget/Media.mjs"
import { Builder } from "./utils/Builder.mjs"

Builder.body({
    children: [
        Media(),
        Bar(),
    ],
})