import { Builder } from "../utils/Builder.mjs"

export function Div(widget = {}) {
    widget.tag = 'div'
    return Builder.build(widget)
}

export function A(widget = {}) {
    widget.tag = 'a'
    return Builder.build(widget)
}

export function Header(widget = {}) {
    widget.tag = 'header'
    return Builder.build(widget)
}

export function Footer(widget = {}) {
    widget.tag = 'footer'
    return Builder.build(widget)
}

export function Input(widget = {}) {
    widget.tag = 'input'
    return Builder.build(widget)
}

export function Iframe(widget = {}) {
    widget.tag = 'iframe'
    return Builder.build(widget)
}

export function P(widget = {}) {
    widget.tag = 'p'
    return Builder.build(widget)
}

export function Button(widget = {}) {
    widget.tag = 'button'
    if (!widget.type) {
        widget.type = 'button'
    }
    return Builder.build(widget)
}

export function Body(widget = {}) {
    widget.tag = 'body'
    return Builder.build(widget)
}

export function Head(widget = {}) {
    widget.tag = 'head'
    return Builder.build(widget)
}

export function Link(widget = {}) {
    widget.tag = 'link'
    return Builder.build(widget)
}