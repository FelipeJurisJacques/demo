import { Button } from "../libraries/layout/Button.mjs"

export class Tab extends Button {
    constructor(context) {
        super({
            class: [
                'tab',
                'active',
            ],
            content: 'aba aberta',
            onActive: () => {
                context.window.toggle = true
                this.class = [
                    'tab',
                    'active',
                ]
            }
        })
    }
}