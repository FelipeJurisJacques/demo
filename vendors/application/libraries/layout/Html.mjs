import { Body } from "./Body.mjs";
import { Head } from "./head.mjs";
import { Widget } from "./Widget.mjs";

export class Html extends Widget {

    #head
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
            } else if (child instanceof Head) {
                this.#body = child
            }
        }
    }

    get head() {
        return this.#head ? this.#head : null
    }

    get body() {
        return this.#body ? this.#body : null
    }
}