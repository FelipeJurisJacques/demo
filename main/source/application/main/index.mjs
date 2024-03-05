import { } from "../kernels/Base.mjs"
import { } from "../controller/Skin.mjs"

const player = document.body.querySelector('button')
player.subscribe(event => {
    if (event.type === 'pointer' && event.pointer.click) {
        const iframe = document.createElement('iframe')
        iframe.setAttribute('frameborder', 2)
        iframe.src = event.target.getAttribute('src')
        document.body.appendChild(iframe)
        iframe.subscribe(event => {
            if (event.type === 'pointer' && event.pointer.grab) {
                let newWidth = event.pointer.x - event.target.offsetLeft
                let newHeight = event.pointer.y - event.target.offsetTop
                event.target.style.width = newWidth + 'px'
                event.target.style.height = newHeight + 'px'
            }
        })
    }
})

