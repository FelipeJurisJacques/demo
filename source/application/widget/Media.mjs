import { Audio } from "../libraries/builder/Elements.mjs";

export function Media() {
    return Audio({
        class: 'media',
        controls: true,
    })
}