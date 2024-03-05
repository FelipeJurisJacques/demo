import { Widget } from "../libraries/layout/Widget.mjs"

export class Tab extends Widget {
    #bar
    #window

    constructor(context) {
        super({
            tag: 'button',
            class: [
                'tab',
                'active',
            ],
            content: 'aba aberta',
            onActive: () => {
                if (this.maximized) {
                    this.minimize()
                } else {
                    this.maximize()
                }
            }
        })
        this.#bar = context.bar
        for (let tab of this.#bar.children) {
            tab.minimize()
        }
        this.#bar.append = this
        this.#window = context.window
    }

    get maximized() {
        return this.class.contains('active')
    }

    minimize() {
        this.class = 'tab'
        this.#window.toggle = false
    }

    maximize() {
        for (let tab of this.#bar.children) {
            tab.minimize()
        }
        this.class = [
            'tab',
            'active',
        ]
        this.#window.toggle = true
    }
}