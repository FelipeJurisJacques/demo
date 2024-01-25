import { File } from "../utils/File.mjs";
import { Window } from "../widget/Window.mjs";

export function Explorer() {
    File.install()
    // File.glob().then(files => {
    //     console.log(files)
    // }).catch(error => {
    //     console.error(error)
    // })
    return Window({}, {
        onDropFile: async function (event) {
            for (let file of event.files) {
                file.copy('/temporary/')
            }
        },
    })
}