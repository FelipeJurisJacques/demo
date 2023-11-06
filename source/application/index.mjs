import { } from "./kernels/Base.mjs"

document.build({
    tag: 'body',
    children: [
        {
            tag: 'footer',
            children: [
                {
                    tag: 'button',
                    content: 'Player',
                },
            ],
        },
    ],
})