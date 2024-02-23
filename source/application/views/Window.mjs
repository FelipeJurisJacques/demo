import { P } from "../libraries/layout/P.mjs";
import { Div } from "../libraries/layout/Div.mjs";
import { Button } from "../libraries/layout/Button.mjs";

export class Window extends Div {
    #tab

    constructor(context) {
        super({
            class: [
                'window',
                'maximized',
            ],
            children: [
                new Div({
                    class: 'tool_bar',
                    children: [
                        new Button({
                            class: 'max',
                        }),
                        new P({
                            content: 'nova janela',
                        }),
                        new Button({
                            class: 'min',
                            onActive: () => {
                                this.toggle = false
                                this.#tab.class = 'tab'
                            }
                        }),
                        new Button({
                            class: 'max',
                        }),
                        new Button({
                            class: 'close',
                            onActive: () => {
                                this.remove()
                            },
                        }),
                    ],
                }),
                new Div({
                    class: 'content',
                }),
            ],
        })
        this.#tab = new Button({
            class: [
                'tab',
                'active',
            ],
            content: 'aba aberta',
            onActive: () => {
                this.toggle = true
                this.#tab.class = [
                    'tab',
                    'active',
                ]
            }
        })
        context.taskBar.append = this.#tab
    }

    deconstruct() {
        this.#tab.deconstruct()
        super.deconstruct()
    }

    remove() {
        this.#tab.remove()
        super.remove()
    }
}