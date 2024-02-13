import { Bar } from "../widget/Bar.mjs";
import { Html } from "../libraries/layout/Html.mjs";
import { Body } from "../libraries/layout/Body.mjs";

export class Main extends Html {
    constructor() {
        super({
            children: [
                new Body({
                    children: [
                        new Bar(),
                    ],
                }),
            ],
        })
    }
}