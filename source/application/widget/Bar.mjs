import { Player } from "../views/Player.mjs"
import { Button, Footer } from "./Elements.mjs"

export function Bar() {
    const player = Button({
        child: new URL('/source/image/icon/player.svg', location.origin),
        title: 'Player',
    })
    player.subscribe(event => {
        if (event.type === 'pointer' && event.pointer.click) {
            document.body.appendChild(Player())
        }
    })
    return Footer({
        class: 'bar',
        children: [
            player,
        ],
    })
}
