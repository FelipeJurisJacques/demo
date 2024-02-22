import { Button } from "../libraries/layout/Button.mjs";
import { Footer } from "../libraries/layout/Footer.mjs";

export class TaskBar extends Footer {
    constructor(context) {
        super({
            class: 'task_bar',
            children: [
                new Button({
                    class: 'start',
                    title: 'Start',
                    onActive: function (event) {
                        if (!context.menu.toggle) {
                            context.menu.toggle = true
                            context.menu.focus()
                        }
                    }
                }),
                // new Button({
                //     // child: new URL('/source/image/icon/player.svg', location.origin),
                //     title: 'Player',
                //     onActive: function (event) {
                //         Views.route('player')
                //     },
                // }),
                // new Button({
                //     // child: new URL('/source/image/icon/player.svg', location.origin),
                //     title: 'Contacts',
                //     onActive: function (event) {
                //         Views.route('contacts')
                //     },
                // }),
            ],
        })
    }
}