import { Main } from "../views/Main.mjs";
import { Window } from "../views/Window.mjs";
import { Desktop } from "../widget/Desktop.mjs";
import { TaskBar } from "../widget/TaskBar.mjs";
import { StartMenu } from "../widget/StartMenu.mjs";
import { Controller } from "../libraries/route/Controller.mjs";

export class IndexController extends Controller {

    #bar
    #menu
    #desktop
    #windows
    #document

    constructor() {
        super()
        this.#menu = new StartMenu({
            controller: this,
        })
        this.#bar = new TaskBar({
            menu: this.#menu,
        })
        this.#windows = []
        this.#desktop = new Desktop({
            bar: this.#bar,
            menu: this.#menu,
            windows: this.#windows,
        })
        this.#document = new Main({
            desktop: this.#desktop,
        })
        this.explorer()
    }

    explorer() {
        const window = new Window({
            taskBar: this.#bar,
        })
        this.#windows.push(window)
        this.#desktop.append = window
    }
}