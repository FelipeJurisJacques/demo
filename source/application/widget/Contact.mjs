import { Div, P } from "./Elements.mjs";

export function Contact() {
    return Div({
        class: 'contact',
        children: [
            new URL('source/image/icon/folder_user.svg', window.location.origin),
            P({
                content: 'Nome do Contato',
            }),
        ],
    })
}