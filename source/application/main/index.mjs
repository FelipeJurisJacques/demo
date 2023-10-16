import { } from "../kernels/Base.mjs"
import { } from "../controller/Skin.mjs"

let isResizing = false
const player = document.body.querySelector('button')
player.subscribe(event => {
    if (event.type === 'click') {
        const iframe = document.createElement('iframe')
        iframe.setAttribute('frameborder', 2)
        iframe.src = event.target.getAttribute('src')
        document.body.appendChild(iframe)

        
        // let newWidth = e.clientX - iframe.offsetLeft
        // let newHeight = e.clientY - iframe.offsetTop
        // iframe.style.width = newWidth + 'px'
        // iframe.style.height = newHeight + 'px'
    }
})

