import { Widget } from "../libraries/layout/Widget.mjs";

export class TaskBar extends Widget {
    constructor(context) {
        super({
            tag: 'footer',
            class: 'task_bar',
            children: [
                new Widget({
                    tag: 'button',
                    class: 'start',
                    title: 'Start',
                    onActive: function () {
                        if (!context.menu.toggle) {
                            context.menu.toggle = true
                            context.menu.focus()
                        }
                    }
                }),
                context.bar,
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