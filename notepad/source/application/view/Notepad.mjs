export class Notepad {
    constructor(document) {
        document.body.style = {
            grid: {
                columns: 1,
                template: {
                    rows: [
                        '30px',
                        'auto',
                        '30px',
                    ],
                }
            }
        }
        document.body.children = [
            {
                tag: 'header',
                child: {
                    tag: 'ul',
                    style: {
                        orientation: 0,
                    },
                    children: [
                        {
                            tag: 'li',
                            child: {
                                tag: 'button',
                                content: 'File',
                            },
                        },
                        {
                            tag: 'li',
                            child: {
                                tag: 'button',
                                content: 'Edit',
                            },
                        },
                        {
                            tag: 'li',
                            child: {
                                tag: 'button',
                                content: 'Format',
                            },
                        },
                    ],
                },
            },
            {
                tag: 'textarea',
            },
            {
                tag: 'footer',
                child: {
                    tag: 'ul',
                    style: {
                        orientation: 0,
                    },
                    children: [
                        {
                            tag: 'li',
                            content: 'Ln 1',
                        },
                        {
                            tag: 'li',
                            content: 'Col 1',
                        },
                        {
                            tag: 'li',
                            content: 'Len 1',
                        },
                    ],
                },
            },
        ]
    }
}