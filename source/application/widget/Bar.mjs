import { Widget } from "../libraries/layout/Widget.mjs";

export class Bar extends Widget {
    constructor() {
        super({
            tag: 'div',
            class: 'bar',
        })
    }
}