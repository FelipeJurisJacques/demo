export class Builder {
    static head(widget = {}) {
        return window.document.head.rebuild(widget)
    }

    static body(widget = {}) {
        return window.document.body.rebuild(widget)
    }

    static build(widget = {}) {
        if (widget instanceof HTMLElement) {
            return widget
        }
        const element = window.document.createElement(widget.tag)
        element.rebuild(widget)
        return element
    }
}

Document.prototype.build = Builder.build
HTMLElement.prototype.rebuild = function (widget = {}) {
    for (let name in widget) {
        switch (name) {
            case 'tag':
                break
            case 'id':
            case 'src':
            case 'type':
            case 'width':
            case 'height':
                this[name] = widget[name]
                break
            case 'class':
                this.className = widget.class
                break
            case 'content':
                if (typeof widget.content === 'object') {
                    if (widget.content instanceof URL) {
                        fetch(widget.content).then(response => {
                            response.text().then(body => {
                                this.innerText = body
                            })
                        })
                    }
                } else {
                    this.innerText = widget.content
                }
                break
            case 'child':
                if (typeof widget.child === 'object') {
                    if (widget.child instanceof URL) {
                        fetch(widget.child).then(response => {
                            response.text().then(body => {
                                this.innerHTML = body
                            })
                        })
                    }
                } else {
                    this.appendChild(window.document.build(widget.child))
                }
                break
            case 'children':
                for (let child of widget.children) {
                    this.appendChild(window.document.build(child))
                }
                break
            default:
                this.setAttribute(name, widget[name])
                break
        }
    }
    return this
}