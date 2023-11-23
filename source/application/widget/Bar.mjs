import { Player } from "../views/Player.mjs"
import { Contacts } from "../views/Contacts.mjs"
import { Button, Footer } from "./Elements.mjs"

export function Bar() {
    return Footer({
        class: 'bar',
        children: [
            Button({
                child: new URL('/source/image/icon/player.svg', location.origin),
                title: 'Player',
                onAction: function (event) {
                    document.body.appendChild(Player())
                },
            }),
            Button({
                child: new URL('/source/image/icon/player.svg', location.origin),
                title: 'Contacts',
                onAction: function (event) {
                    document.body.appendChild(Contacts())
                },
            }),
        ],
    })
}
