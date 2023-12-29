import { Window } from "../widget/Window.mjs";
import { Contact } from "../widget/Contact.mjs";
import { File } from "../utils/File.mjs";

export function Explorer() {
    File.glob().then(files => {
        console.log(files)
    }).catch(error => {
        console.error(error)
    })
    return Window({}, {
        onDropFile: async function (event) {
            for (let file of event.files) {
                file.copy('/temporary/')
            }
        },
    })
}