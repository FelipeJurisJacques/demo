import { Widget } from "./Widget.mjs";

export class Frame {

    /**
     * @var {Widget}
     */
    #body

    /**
     * @var {Widget}
     */
    #head

    /**
     * @var {Document}
     */
    #document

    constructor(context = {}) {
        if (context.document) {
            this.#document = context.document
        } else {
            this.#document = document
        }
        if (!context.body) {
            context.body = {}
        }
        if (!context.head) {
            context.head = {}
        }
        context.body.tag = this.#document.body
        context.head.tag = this.#document.head
        this.#body = new Widget(context.body)
        this.#head = new Widget(context.head)
    }

    /**
     * @returns {Widget}
     */
    get head() {
        return this.#head
    }

    /**
     * @returns {Widget}
     */
    get body() {
        return this.#body
    }
}