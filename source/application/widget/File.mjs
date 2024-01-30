import { Builder } from "../utils/Builder.mjs";

/**
 * @param {File} stream 
 */
export function File(stream) {
    return Builder.build({
        tag: 'button',
        class: 'file',
        children: [
            new URL('source/image/icon/folder_user.svg', window.location.origin),
            {
                tag: 'p',
                content: stream.name,
            },
        ],
        onClick: event => {
            if (stream.isDirectory) {
                console.log('abrir pasta')
            } else {
                console.log('abrir aquivo')
            }
        }
    })
}