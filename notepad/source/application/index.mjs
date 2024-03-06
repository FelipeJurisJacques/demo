import { Frame } from "../../../vendors/application/libraries/layout/Frame.mjs";
import { Notepad } from "./view/Notepad.mjs";
import { Application } from "../../../vendors/application/libraries/base/Application.mjs";

class Main extends Application {
    #document

    main() {
        this.#document = new Frame()
        const view = new Notepad(this.#document)
    }
}

const application = new Main()
application.main()