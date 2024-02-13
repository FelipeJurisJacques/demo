import { Body } from "./Body.mjs";
import { Widget } from "./Widget.mjs";

export class Html extends Widget {

    #body

    constructor(context = {}) {
        context.tag = window.document
        const children = context.children
        if (children) {
            delete context.children
        }
        super(context)
        for (let child of children) {
            if (child instanceof Body) {
                this.#body = child
            }
        }
    }
}