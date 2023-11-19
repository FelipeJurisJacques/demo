import { Player } from "../views/Player.mjs"
import { Button, Footer } from "./Elements.mjs"

export function Bar() {
    return Footer({
        class: 'bar',
        children: [
            Button({
                child: new URL('/source/image/icon/player.svg', location.origin),
                title: 'Player',
                onDoubleClick: function (event) {
                    document.body.appendChild(Player())
                },
                onLongClick: function (event) {
                    document.body.appendChild(Player())
                },
            }),
        ],
    })
}
