import { Div, P } from "./Elements.mjs";

export function Contact(name) {
    return Div({
        class: 'file',
        children: [
            new URL('source/image/icon/folder_user.svg', window.location.origin),
            P({
                content: name,
            }),
        ],
    })
}