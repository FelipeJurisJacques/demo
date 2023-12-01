import { Path, Sub, Sum, Translate } from "../styles/Style.mjs";
import { Button, Div, Footer, Header, P } from "./Elements.mjs";

export function Window(header = {}, content = {}, footer = []) {
    content.class = 'content'
    const window = Div({
        class: 'window',
        style: {
            width: '100%',
            height: '100%',
        },
    })
    window.rebuild({
        children: [
            Header({
                children: [
                    Div({
                        class: [
                            'expanded',
                            'background',
                        ],
                        style: {
                            clipPath: Path([
                                [0, 0],
                                [CSS.percent(30), 0],
                                [Sum(CSS.percent(30), 15), 15],
                                [Sub(CSS.percent(70), 15), 15],
                                [CSS.percent(70), 0],
                                [CSS.percent(100), 0],
                                [Sub(CSS.percent(100), 15), 15],
                                [Sub(CSS.percent(100), 45), 15],
                                [Sub(CSS.percent(100), 50), 20],
                                [50, 20],
                                [35, 5],
                                [5, 5],
                                //
                                [0, 0],
                                [Sub(CSS.percent(100), 42), 16],
                                [Sub(CSS.percent(100), 46), 20],
                                [Sub(CSS.percent(100), 48), 20],
                                [Sub(CSS.percent(100), 44), 16],
                                [Sub(CSS.percent(100), 42), 16],
                                //
                                [0, 0],
                                [Sub(CSS.percent(100), 38), 16],
                                [Sub(CSS.percent(100), 42), 20],
                                [Sub(CSS.percent(100), 44), 20],
                                [Sub(CSS.percent(100), 40), 16],
                                [Sub(CSS.percent(100), 38), 16],
                                //
                                [0, 0],
                                [Sub(CSS.percent(100), 34), 16],
                                [Sub(CSS.percent(100), 38), 20],
                                [Sub(CSS.percent(100), 40), 20],
                                [Sub(CSS.percent(100), 36), 16],
                                [Sub(CSS.percent(100), 34), 16],
                            ]),
                        },
                    }),
                    P({
                        class: 'title',
                        content: 'nova aba',
                    }),
                    Button({
                        class: 'close',
                        title: 'Close',
                        child: new URL('/source/image/icon/close.svg', location.origin),
                        onAction: function (event) {
                            window.remove()
                        },
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

                            }),
                        ],
                    }),
                    Div(content),
                ],
            }),
        ],
    })
    return window
}