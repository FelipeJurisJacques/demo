import { Widget } from "./Widget.mjs";

export class Body extends Widget {
    constructor(context) {
        context.tag = window.document.body
        super(context)
    }
}