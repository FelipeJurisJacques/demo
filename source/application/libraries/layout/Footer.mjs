import { Widget } from "./Widget.mjs";

export class Footer extends Widget {
    constructor(context = {}) {
        context.tag = window.document.createElement('footer')
        super(context)
    }
}