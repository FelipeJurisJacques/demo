import { Html } from "../libraries/layout/Html.mjs";

export class Main extends Html {
    constructor(context) {
        super({
            children: [
                context.desktop,
            ],
        })
    }
}