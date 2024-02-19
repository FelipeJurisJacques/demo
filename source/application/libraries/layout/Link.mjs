import { Widget } from "./Widget.mjs";

export class Link extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('link')
        super(context)
    }
}