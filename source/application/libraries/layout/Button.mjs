import { Widget } from "./Widget.mjs";

export class Button extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('button')
        super(context)
    }
}