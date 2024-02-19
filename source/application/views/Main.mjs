import { Ul } from "../libraries/layout/Ul.mjs";
import { Li } from "../libraries/layout/Li.mjs";
import { Div } from "../libraries/layout/Div.mjs";
import { Body } from "../libraries/layout/Body.mjs";
import { Head } from "../libraries/layout/head.mjs";
import { Link } from "../libraries/layout/Link.mjs";
import { Html } from "../libraries/layout/Html.mjs";
import { Footer } from "../libraries/layout/Footer.mjs";
import { Button } from "../libraries/layout/Button.mjs";

export class Main extends Html {
    constructor() {
        const menu = new Div({
            class: 'start_menu',
            onBlur: function (event) {
                this.toggle = false
            },
            children: [
                new Ul({
                    children: [
                        new Li({
                            child: new Button({
                                class: 'explorer',
                                title: 'Explorer',
                                content: 'Explorador de arquivos',
                                onActive: function (event) {
                                    console.log(event)
                                    Views.route('explorer')
                                },
                            }),
                        }),
                    ],
                }),
            ],
        })
        super({
            children: [
                new Head({
                    children: [
                        new Link({
                            rel: 'stylesheet',
                            href: new URL('source/stylesheet/bar.css', window.location.origin),
                        }),
                        new Link({
                            rel: 'stylesheet',
                            href: new URL('source/stylesheet/index.css', window.location.origin),
                        }),
                        // new Link({
                        //     rel: 'stylesheet',
                        //     href: new URL('source/stylesheet/player.css', window.location.origin),
                        // }),
                        new Link({
                            rel: 'stylesheet',
                            href: new URL('source/stylesheet/windows.css', window.location.origin),
                        }),
                        // new Link({
                        //     rel: 'stylesheet',
                        //     href: new URL('source/stylesheet/contact.css', window.location.origin),
                        // }),
                        new Link({
                            rel: 'stylesheet',
                            href: new URL('source/stylesheet/start_menu.css', window.location.origin),
                        }),
                    ],
                }),
                new Body({
                    children: [
                        menu,
                        new Footer({
                            class: 'bar',
                            children: [
                                new Button({
                                    class: 'start',
                                    title: 'Start',
                                    onActive: function (event) {
                                        if (menu.toggle) {
                                            menu.toggle = false
                                        } else {
                                            menu.toggle = focus
                                            menu.focus()
                                        }
                                    }
                                }),
                                // new Button({
                                //     // child: new URL('/source/image/icon/player.svg', location.origin),
                                //     title: 'Player',
                                //     onActive: function (event) {
                                //         Views.route('player')
                                //     },
                                // }),
                                // new Button({
                                //     // child: new URL('/source/image/icon/player.svg', location.origin),
                                //     title: 'Contacts',
                                //     onActive: function (event) {
                                //         Views.route('contacts')
                                //     },
                                // }),
                            ],
                        })
                    ],
                }),
            ],
        })
    }
}