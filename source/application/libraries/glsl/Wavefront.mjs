export class Wavefront {

    /**
     * @var {string}
     */
    #content

    /**
     * @param {string} content
     */
    constructor(content) {
        this.#content = content
    }

    render() {
        return [
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,]
        const vertices = []
        const lines = this.#content.split('\n')
        lines.forEach(function (line) {
            const parts = line.trim().split(/\s+/)
            if (parts[0] === 'v') {
                for (let i = 1; i < parts.length; i++) {
                    vertices.push(parseFloat(parts[i]))
                }
            }
        })
        return vertices
    }
}