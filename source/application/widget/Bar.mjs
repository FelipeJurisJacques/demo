import { Player } from "../views/Player.mjs"
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
        ],
    })
}
