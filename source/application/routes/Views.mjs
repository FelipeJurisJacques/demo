import { Player } from "../views/Player.mjs"
import { Contacts } from "../views/Contacts.mjs"
import { Explorer } from "../views/Explorer.mjs"

export class Views {
    static route(path) {
        switch (path) {
            case 'player':
                document.body.appendChild(Player())
                break
            case 'contacts':
                document.body.appendChild(Contacts())
                break
            case 'explorer':
                document.body.appendChild(Explorer())
                break
            default:
                break
        }
        window.location.hash = path
    }
}

window.subscribe(event => {
    if (event.type === 'load' && window.location.hash) {
        Views.route(window.location.hash.substring(1))
    }
})