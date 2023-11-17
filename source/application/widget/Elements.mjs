export function Div(widget = {}) {
    widget.tag = 'div'
    return window.document.build(widget)
}

export function A(widget = {}) {
    widget.tag = 'a'
    return window.document.build(widget)
}

export function Header(widget = {}) {
    widget.tag = 'header'
    return window.document.build(widget)
}

export function Footer(widget = {}) {
    widget.tag = 'footer'
    return window.document.build(widget)
}

export function Input(widget = {}) {
    widget.tag = 'input'
    return window.document.build(widget)
}

export function Iframe(widget = {}) {
    widget.tag = 'iframe'
    return window.document.build(widget)
}

export function P(widget = {}) {
    widget.tag = 'p'
    return window.document.build(widget)
}

export function Button(widget = {}) {
    widget.tag = 'button'
    if (!widget.type) {
        widget.type = 'button'
    }
    return window.document.build(widget)
}

export function Body(widget = {}) {
    widget.tag = 'body'
    return window.document.build(widget)
}

export function Head(widget = {}) {
    widget.tag = 'head'
    return window.document.build(widget)
}

export function Link(widget = {}) {
    widget.tag = 'link'
    return window.document.build(widget)
}