import { Audio } from "./Elements.mjs";

export function Media() {
    return Audio({
        class: 'media',
        controls: true,
    })
}