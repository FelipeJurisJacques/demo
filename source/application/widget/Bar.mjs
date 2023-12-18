import { Button, Footer } from "./Elements.mjs"
import { Views } from "../routes/Views.mjs"

export function Bar() {
    return Footer({
        class: 'bar',
        children: [
            Button({
                child: new URL('/source/image/icon/player.svg', location.origin),
                title: 'Player',
                onAction: function (event) {
                    Views.route('player')
                },
            }),
            Button({
                child: new URL('/source/image/icon/player.svg', location.origin),
                title: 'Contacts',
                onAction: function (event) {
                    Views.route('contacts')
                },
            }),
            Button({
                child: new URL('/source/image/icon/folder.svg', location.origin),
                title: 'Explorer',
                onAction: function (event) {
                    Views.route('explorer')
                },
            }),
        ],
    })
}
