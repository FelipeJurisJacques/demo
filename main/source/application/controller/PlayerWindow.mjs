import { Window } from "./Window.mjs";

export class PlayerWindow extends Window {
    constructor() {
        super()
        const body = document.createElement('div')
        const player = document.createElement('audio')
        const footer = document.createElement('div')
        const header = document.createElement('div')
        const file = document.createElement('input')
        file.type = 'file'
        body.className = 'body'
        footer.className = 'footer'
        header.className = 'header'
        body.appendChild(file)
        header.appendChild(player)
        this.tab.appendChild(header)
        this.tab.appendChild(body)
        this.tab.appendChild(footer)

        // <audio controls autoplay>
        // <source src="horse.ogg" type="audio/ogg">
        // <source src="horse.mp3" type="audio/mpeg">
        // Your browser does not support the audio element.
        // </audio>
    }
}