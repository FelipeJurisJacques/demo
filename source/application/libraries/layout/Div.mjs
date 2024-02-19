import { Widget } from "./Widget.mjs";

export class Div extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('div')
        super(context)
    }
}