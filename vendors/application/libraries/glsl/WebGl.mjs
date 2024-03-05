export class WebGl {

    /**
     * @var {HTMLElement}
    */
    #element

    /**
     * @var {Array}
     */
    #renderable

    /**
     * @param {URL} from
     * @returns {Promise<string>}
    */
    static async import(from) {
        const response = await fetch(from)
        return await response.text()
    }

    /**
     * @param {HTMLElement} canvas
    */
    constructor(canvas) {
        this.#element = canvas
        this.#renderable = []
    }

    push(model) {
        this.#renderable.push(model)
    }

    /**
     * @param {string} vertex
     * @param {string} fragment
     * @returns {void}
     */
    render(vertex, fragment) {
        const gl = this.#element.getContext('webgl')
        const vertexShader = this.#compileShader(gl, vertex, gl.VERTEX_SHADER)
        const fragmentShader = this.#compileShader(gl, fragment, gl.FRAGMENT_SHADER)
        const program = this.#createProgram(gl, vertexShader, fragmentShader)
        gl.useProgram(program)
        const positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        const list = []
        for (let model of this.#renderable) {
            list.push(model.render())
        }
        const vertices = new Float32Array(list)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        const positionLocation = gl.getAttribLocation(program, 'a_position')
        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    #compileShader(gl, source, type) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            return null
        }
        return shader
    }

    #createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Não foi possível linkar o programa de shader:', gl.getProgramInfoLog(program))
            gl.deleteProgram(program)
            return null
        }
        return program
    }
}