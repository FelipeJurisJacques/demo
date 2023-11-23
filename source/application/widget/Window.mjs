import { Button, Div, Footer, Header } from "./Elements.mjs";

export function Window(header = {}, content = {}, footer = []) {
    if (!header.children) {
        header.children = []
    }
    header.class = 'content'
    content.class = 'content'
    const window = Div({
        class: 'window',
        style: {
            width: '100%',
            height: '100%',
        },
    })
    header.children.push(Button({
        class: 'close',
        content: 'x',
        onAction: function (event) {
            window.remove()
        },
    }))
    window.rebuild({
        children: [
            Header({
                children: [
                    Div({
                        class: 'background',
                        children: [
                            Div({
                                class: 'part1',
                            }),
                            Div({
                                class: 'part2',
                            })
                        ],
                    }),
                    Div(header),
                ],
            }),
            Div({
                class: 'container',
                children: [
                    Div({
                        class: 'background',
                        children: [
                            Div({
                                class: 'part1',
                            })
                        ],
                    }),
                    Div(content),
                ],
            }),
            Footer({
                children: [
                    Div({
                        class: 'background',
                        children: [
                            Div({
                                class: 'part1',
                            }),
                        ],
                    }),
                    Div({
                        class: 'content',
                        children: footer,
                    }),
                ],
            }),
        ],
    })
    return window
    // const iframe = document.build({
    //     tag: 'iframe',
    //     src: event.target.src,
    //     frameborder: 2,
    // })
    // document.body.appendChild(iframe)
    // iframe.subscribe(event => {
    //     if (event.type === 'pointer' && event.pointer.grab) {
    //         let newWidth = event.pointer.x - event.target.offsetLeft
    //         let newHeight = event.pointer.y - event.target.offsetTop
    //         event.target.style.width = newWidth + 'px'
    //         event.target.style.height = newHeight + 'px'
    //     }
    // })
}