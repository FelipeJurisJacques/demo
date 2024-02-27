import { Body } from "../libraries/layout/Body.mjs";

export class Desktop extends Body {
    constructor(context) {
        const list = [
            context.menu,
            context.taskBar,
        ]
        // for (let window of context.windows) {
        //     list.push(window)
        // }
        super({
            children: list,
        })
    }
}