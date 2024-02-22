import { Div } from "../libraries/layout/Div.mjs";
import { Button } from "../libraries/layout/Button.mjs";

export class Window extends Div {
    #tab

    constructor(context) {
        super({
            class: 'window',
            children: [
                new Div({
                    class: 'tool_bar',
                    children: [
                        new Button({
                            class: 'close',
                            onActive: () => {
                                this.remove()
                            },
                        }),
                        new Button({
                            class: [
                                'max',
                                'expanded',
                            ],
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