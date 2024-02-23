import { Widget } from "./Widget.mjs";

export class P extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('p')
        super(context)
    }
}