import { Widget } from "./Widget.mjs";

export class Ul extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('ul')
        super(context)
    }
}