import { Bar } from "../widget/Bar.mjs";
import { Main } from "./Main.mjs";
import { Desktop } from "../widget/Desktop.mjs";
import { TaskBar } from "../widget/TaskBar.mjs";
import { StartMenu } from "../widget/StartMenu.mjs";
import { ExplorerController } from "../controller/ExplorerController.mjs";

export class Index {
    #bar
    #menu
    #desktop
    #taskBar
    #document

    constructor() {
        this.#menu = new StartMenu({
            controller: this,
        })
        this.#bar = new Bar()
        this.#taskBar = new TaskBar({
            bar: this.#bar,
            menu: this.#menu,
        })
        this.#desktop = new Desktop({
            menu: this.#menu,
            taskBar: this.#taskBar,
        })
        this.#document = new Main({
            desktop: this.#desktop,
        })
        this.explorer()
    }

    explorer() {
        new ExplorerController({
            bar: this.#bar,
            desktop: this.#desktop,
        })
    }
}