import { Div, Footer, Header } from "./Elements.mjs";

export function Window(header = [], content = [], footer = []) {
    return document.build(Div({
        class: 'window',
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
                    Div({
                        class: 'content',
                        children: header,
                    }),
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
                    Div({
                        class: 'content',
                        children: content,
                    }),
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
    }))
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