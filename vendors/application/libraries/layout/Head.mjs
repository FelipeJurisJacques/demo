import { Widget } from "./Widget.mjs";

export class Head extends Widget {
    constructor(context = {}) {
        context.tag = window.document.head
        super(context)
    }
}