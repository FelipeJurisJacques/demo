// import { File } from "../utils/File.mjs";
import { File } from "../models/File.mjs";
import { Window } from "../widget/Window.mjs";

export function Explorer() {
    File.install().then(async event => {
        // const files = await File.glob()
        // console.log(files)
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