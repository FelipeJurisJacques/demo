export function Footer() {
    const player = document.build({
        tag: 'button',
        src: './source/navigation/player/index.html',
        content: 'Player',
    })
    player.subscribe(event => {
        if (event.type === 'pointer' && event.pointer.click) {
            const iframe = document.build({
                tag: 'iframe',
                src: event.target.src,
                frameborder: 2,
            })
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
    return document.build({
        tag: 'footer',
        children: [
            player,
        ],
    })
}
