import { Li } from "../libraries/layout/Li.mjs"
import { Ul } from "../libraries/layout/Ul.mjs"
import { Div } from "../libraries/layout/Div.mjs"
import { Button } from "../libraries/layout/Button.mjs"

export class StartMenu extends Div {
    constructor() {
        super({
            class: 'start_menu',
            onLeaving: () => {
                setTimeout(() => {
                    this.toggle = false
                }, 50)
            },
            children: [
                new Ul({
                    children: [
                        new Li({
                            child: new Button({
                                class: 'explorer',
                                title: 'Explorer',
                                content: 'Explorador de arquivos',
                                onActive: () => {
                                    this.toggle = false
                                },
                            }),
                        }),
                    ],
                }),
            ],
        })
    }
}