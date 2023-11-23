import { Window } from "../widget/Window.mjs";

export function Contacts() {
    return Window({}, {
        onDropFile: function (event) {
            console.log(event.files)
            // console.log(event.dataTransfer.items, event.dataTransfer.files)
            // for (let item of event.dataTransfer.items) {
            //     console.log(item, item.webkitGetAsEntry())
            // }
            // console.log(event)
        },
    })
}