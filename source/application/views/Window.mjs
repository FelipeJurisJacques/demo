import { Tab } from "../widget/Tab.mjs";
import { Widget } from "../libraries/layout/Widget.mjs";

export class Window extends Widget {
    #tab

    constructor(context) {
        super({
            tag: 'div',
            class: [
                'window',
                'maximized',
            ],
            children: [
                new Widget({
                    tag: 'div',
                    class: 'tool_bar',
                    children: [
                        new Widget({
                            tag: 'button',
                            class: 'max',
                        }),
                        new Widget({
                            tag: 'p',
                            content: 'nova janela',
                        }),
                        new Widget({
                            tag: 'button',
                            class: 'min',
                            onActive: () => {
                                this.#tab.minimize()
                            }
                        }),
                        new Widget({
                            tag: 'button',
                            class: 'max',
                        }),
                        new Widget({
                            tag: 'button',
                            class: 'close',
                            onActive: () => {
                                this.remove()
                            },
                        }),
                    ],
                }),
                new Widget({
                    tag: 'div',
                    class: 'content',
                }),
            ],
        })
        context.desktop.append = this
        this.#tab = new Tab({
            bar: context.bar,
            window: this,
        })
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