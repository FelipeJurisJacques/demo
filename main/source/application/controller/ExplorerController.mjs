export class ExplorerController {
    #window
    constructor(context) {
        this.#window = new Window({
            bar: context.bar,
            desktop: context.desktop,
        })
    }
}