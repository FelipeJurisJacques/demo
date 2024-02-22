import { Main } from "../views/Main.mjs";
import { Window } from "../views/Window.mjs";
import { TaskBar } from "../widget/TaskBar.mjs";
import { StartMenu } from "../widget/StartMenu.mjs";
import { Controller } from "../libraries/route/Controller.mjs";

export class IndexController extends Controller {

    #bar
    #menu
    #windows
    #document

    constructor() {
        super()
        this.#bar = new TaskBar({
            menu: this.#menu,
        })
        this.#windows = [
            new Window({
                taskBar: this.#bar,
            }),
        ]
        this.#menu = new StartMenu()
        this.#document = new Main({
            bar: this.#bar,
            menu: this.#menu,
            windows: this.#windows,
        })
    }
}