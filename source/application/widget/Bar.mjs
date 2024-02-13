import { Views } from "../routes/Views.mjs"
import { Button } from "../libraries/layout/Button.mjs"
import { Footer } from "../libraries/layout/Footer.mjs"

export class Bar extends Footer {
    constructor() {
        super({
            class: 'bar',
            children: [
                new Button({
                    child: new URL('/source/image/icon/player.svg', location.origin),
                    title: 'Player',
                    onAction: function (event) {
                        Views.route('player')
                    },
                }),
                new Button({
                    child: new URL('/source/image/icon/player.svg', location.origin),
                    title: 'Contacts',
                    onAction: function (event) {
                        Views.route('contacts')
                    },
                }),
                new Button({
                    child: new URL('/source/image/icon/folder.svg', location.origin),
                    title: 'Explorer',
                    onAction: function (event) {
                        Views.route('explorer')
                    },
                }),
            ],
        })
    }
}
