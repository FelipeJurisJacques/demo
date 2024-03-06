import { Widget } from "../../../../vendors/application/libraries/layout/Widget.mjs";

export class Notepad {
    constructor(document) {
        document.body.children = [
            new Widget({
                tag: 'header',
                child: new Widget({
                    tag: 'ul',
                    children: [
                        new Widget({
                            tag: 'li',
                            child: new Widget({
                                tag: 'button',
                                content: 'File',
                            }),
                        }),
                        new Widget({
                            tag: 'li',
                            child: new Widget({
                                tag: 'button',
                                content: 'Edit',
                            }),
                        }),
                        new Widget({
                            tag: 'li',
                            child: new Widget({
                                tag: 'button',
                                content: 'Format',
                            }),
                        }),
                    ],
                }),
            }),
            new Widget({
                tag: 'p',
            }),
            new Widget({
                tag: 'footer',
                child: new Widget({
                    tag: 'ul',
                    children: [
                        new Widget({
                            tag: 'li',
                            content: 'Ln 1',
                        }),
                        new Widget({
                            tag: 'li',
                            content: 'Col 1',
                        }),
                        new Widget({
                            tag: 'li',
                            content: 'Len 1',
                        }),
                    ],
                }),
            }),
        ]
    }
}