import { File } from "../utils/File.mjs";
import { Input } from "../widget/Elements.mjs";
import { Window } from "../widget/Window.mjs";
import { File as FileElement } from "../widget/File.mjs";

export function Explorer() {
    const view = Window({}, {
        onDropFile: async function (event) {
            for (let file of event.files) {
                file.copy('/temporary/')
            }
        },
    })
    File.install().then(async event => {
        const files = await File.glob()
        const content = view.querySelector('div.content')
        const elements = []
        for (let file of files) {
            elements.push(FileElement(file))
        }
        content.rebuild({
            children: elements
        })
    }).catch(error => {
        console.error(error)
    })
    return view
}