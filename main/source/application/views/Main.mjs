import { Link } from "../libraries/layout/Link.mjs";
import { Head } from "../libraries/layout/head.mjs";
import { Html } from "../libraries/layout/Html.mjs";

export class Main extends Html {
    constructor(context) {
        super({
            children: [
                new Head({
                    children: [
                        new Link({
                            rel: 'stylesheet',
                            href: new URL('source/stylesheet/task_bar.css', window.location.origin),
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
                            href: new URL('source/stylesheet/window.css', window.location.origin),
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
                context.desktop,
            ],
        })
    }
}