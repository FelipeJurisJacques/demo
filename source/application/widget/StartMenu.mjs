import { Widget } from "../libraries/layout/Widget.mjs"

export class StartMenu extends Widget {
    constructor(context) {
        super({
            tag: 'div',
            class: 'start_menu',
            onLeaving: () => {
                setTimeout(() => {
                    this.toggle = false
                }, 50)
            },
            children: [
                new Widget({
                    tag: 'ul',
                    children: [
                        new Widget({
                            tag: 'li',
                            child: new Widget({
                                tag: 'button',
                                class: 'explorer',
                                title: 'Explorer',
                                content: 'Explorador de arquivos',
                                onActive: () => {
                                    this.toggle = false
                                    context.controller.explorer()
                                },
                            }),
                        }),
                    ],
                }),
            ],
        })
    }
}