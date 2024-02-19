import { Widget } from "./Widget.mjs";

export class Li extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('li')
        super(context)
    }
}