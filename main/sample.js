class Vector2 {
  #x
  #y

  constructor(x = 0.0, y = 0.0) {
    this.x = x
    this.y = y
  }

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  set x(value) {
    this.#x = parseFloat(value)
  }

  set y(value) {
    this.#y = parseFloat(value)
  }
}

class Vector3 {
  #x
  #y
  #z

  constructor(x = 0.0, y = 0.0, z = 0.0) {
    this.x = x
    this.y = y
    this.z = z
  }

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  get z() {
    return this.#z
  }

  set x(value) {
    this.#x = parseFloat(value)
  }

  set y(value) {
    this.#y = parseFloat(value)
  }

  set z(value) {
    this.#z = parseFloat(value)
  }
}

class WebGl {

  /**
   * @var {WebGLRenderingContext}
   */
  #gl

  /**
   * @var {HTMLCanvasElement}
   */
  #element

  /**
   * @var {Array<Program>}
   */
  #programs

  constructor(element) {
    this.#element = element
    this.#gl = this.#element.getContext('webgl')
    this.#gl.viewport(0, 0, this.#element.width, this.#element.height)
    this.#gl.clearColor(1.0, 1.0, 1.0, 1.0)
    this.#gl.enable(this.#gl.DEPTH_TEST)
    this.#programs = []
  }

  async render() { }
}

class Program {

  /**
   * @var {HTMLScriptElement|URL|string}
   */
  #vertex

  /**
   * @var {WebGLProgram}
  */
  #program

  /**
   * @var {HTMLScriptElement|URL|string}
   */
  #fragment

  /**
   * @var {Transform}
   */
  #transforms

  /**
   * @param {HTMLScriptElement|URL|string} vertex 
   * @param {HTMLScriptElement|URL|string} fragment 
   */
  constructor(vertex, fragment) {
    this.#vertex = vertex
    this.#program = null
    this.#fragment = fragment
    this.#transforms = []
  }

  append(transform) {
    this.#transforms.push(transform)
  }

  /**
   * @param {WebGLRenderingContext} gl
   * @returns {Promise<void>}
   */
  async handler(gl) {
    if (!this.#program) {
      const vertex = await this.#import(this.#vertex)
      const fragment = await this.#import(this.#fragment)
      const vs = gl.createShader(gl.VERTEX_SHADER)
      gl.shaderSource(vs, vertex)
      gl.compileShader(vs)
      const fs = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(fs, fragment)
      gl.compileShader(fs)
      this.#program = gl.createProgram()
      gl.attachShader(this.#program, vs)
      gl.attachShader(this.#program, fs)
      gl.linkProgram(this.#program)
      gl.useProgram(this.#program)
    }
    for (let transform of this.#transforms) {
      transform.handler(gl, this.#program)
    }
  }

  async #import(value) {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'object') {
      if (value instanceof HTMLScriptElement) {
        return value.textContent
      }
      if (value instanceof URL) {
        const response = await fetch(value)
        return await response.text()
      }
    }
    return null
  }
}

class Transform {

  /**
   * @var {Vector3}
   */
  #position

  constructor() {
    this.#position = new Vector3()
  }

  get position() {
    return this.#position
  }

  /**
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   * @returns {Promise<void>}
   */
  async handler(gl, program) {
    return null
  }
}

class Wavefront extends Transform {

  /**
   * @var {string}
   */
  #path

  /**
   * @var {Array<Vector3>}
   */
  #indices

  /**
   * @var {Array<Vector3>}
   */
  #normals

  /**
   * @var {Array<Vector2>}
   */
  #textures

  /**
   * @var {Array<Vector3>}
   */
  #positions

  /**
   * @var {Object}
   */
  #materials

  /**
   * @param {string} content
   */
  constructor(path) {
    super()
    this.#path = path
    this.#indices = []
    this.#normals = []
    this.#textures = []
    this.#positions = []
    this.#materials = {}
  }

  /**
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   * @returns {Promise<void>}
   */
  async handler(gl, program) {
    if (this.#positions.length === 0) {
      await this.#decodeObject(gl)
    }
    const positions = new Float32Array(this.#positions.length * 3)
    for (let vector of this.#positions) {
      positions.push(vector.x)
      positions.push(vector.y)
      positions.push(vector.z)
    }
  }

  async #import(from) {
    const response = await fetch(from)
    return await response.text()
  }

  /**
   * @param {WebGLRenderingContext} gl
   * @returns {Promise<void>}
   */
  async #decodeObject(gl) {
    const obj = await this.#import(this.#path)
    const lines = obj.split('\n')
    for (let line of lines) {
      let parts = line.trim().split(' ')
      switch (parts[0]) {
        case 'v':
          this.#positions.push(new Vector3(
            parts[1],
            parts[2],
            parts[3]
          ))
          break
        case 'vn':
          this.#normals.push(new Vector3(
            parts[1],
            parts[2],
            parts[3]
          ))
          break
        case 'vt':
          this.#textures.push(new Vector2(
            parts[1],
            parts[2]
          ))
          break;
        case 'f':
          for (let part of parts) {
            let vertex = part.split('/')
            this.#indices.push(new Vector3(
              parseInt(vertex[0]) - 1,
              parseInt(vertex[1]) - 1,
              parseInt(vertex[2]) - 1
            ))
          }
          break
        case 'mtllib':
          await this.#decodeMtl(gl, parts[1])
          break
      }
    }
  }

  /**
   * @param {WebGLRenderingContext} gl
   * @param {string} file
   * @returns {Promise<void>}
   */
  async #decodeMtl(gl, file) {
    const list = this.#path.split('/')
    list.pop()
    const path = list.join('/')
    const mtl = await this.#import(`${path}/${file}`)
    const lines = mtl.split('\n')
    let name = null
    for (let line of lines) {
      let parts = line.trim().split(' ')
      switch (parts[0]) {
        case 'newmtl':
          name = parts[1]
          this.#materials[name] = {
            name: name,
            ambient: null,
            diffuse: null,
            specular: null,
            shininess: null,
            texture: null
          }
          break
        case 'Ka':
          this.#materials[name].ambient = new Vector3(
            parts[1],
            parts[2],
            parts[3]
          )
          break
        case 'Kd':
          this.#materials[name].diffuse = new Vector3(
            parts[1],
            parts[2],
            parts[3]
          )
          break
        case 'Ks':
          this.#materials[name].specular = new Vector3(
            parts[1],
            parts[2],
            parts[3]
          )
          break
        case 'Ns':
          this.#materials[name].shininess = parseFloat(parts[1])
          break
        case 'map_Kd':
          this.#materials[name].texture = gl.createTexture()
          let image = new Image()
          image.onload = () => {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, currentMaterial.texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          }
          image.src = `${path}${parts[1]}`
          break
      }
    }
  }
}

async function importar(from) {
  const response = await fetch(from)
  return await response.text()
}

const path = `${location.origin}/source/assets/wavefront/cube/`
const file = 'cube'
const canvas = document.getElementById("webgl-canvas");

async function executar() {

  // Obter o elemento canvas

  // Inicializar o contexto WebGL
  var gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Seu navegador ou sua máquina não suporta WebGL.");
  }

  // Definir a cor de fundo para azul
  gl.clearColor(0.0, 0.0, 1.0, 1.0);

  // Limpar o buffer de cores
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Criar os shaders de vértice e de fragmento
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Definir o código do shader de vértice
  var vertexShaderSource = `
attribute vec3 aVertexPosition; // A posição do vértice
attribute vec3 aVertexNormal; // A normal do vértice
attribute vec2 aTextureCoord; // A coordenada de textura do vértice

uniform mat4 uModelViewMatrix; // A matriz de modelo e visão
uniform mat4 uProjectionMatrix; // A matriz de projeção
uniform mat3 uNormalMatrix; // A matriz de transformação das normais

varying highp vec2 vTextureCoord; // A coordenada de textura interpolada
varying highp vec3 vLighting; // A iluminação interpolada

void main(void) {
  // Calcular a posição do vértice projetada no espaço de tela
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);

  // Passar a coordenada de textura para o shader de fragmento
  vTextureCoord = aTextureCoord;

  // Aplicar a transformação das normais
  highp vec3 transformedNormal = uNormalMatrix * aVertexNormal;

  // Calcular a iluminação usando uma fonte de luz direcional
  highp vec3 lightDirection = normalize(vec3(-0.5, -0.5, -0.5));
  highp float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
  vLighting = vec3(0.2, 0.2, 0.2) + vec3(0.8, 0.8, 0.8) * directionalLightWeighting;
}
`;

  // Definir o código do shader de fragmento
  var fragmentShaderSource = `
varying highp vec2 vTextureCoord; // A coordenada de textura interpolada
varying highp vec3 vLighting; // A iluminação interpolada

uniform sampler2D uSampler; // A textura do cubo

void main(void) {
  // Obter a cor da textura na coordenada de textura
  highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

  // Multiplicar a cor da textura pela iluminação
  gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  gl_FragColor=vec4(1.,0.,0.,1.);
}
`;

  // Compilar os shaders
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // Criar o programa que liga os shaders
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Usar o programa
  gl.useProgram(shaderProgram);

  // Obter as localizações dos atributos e das uniformes
  var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  var vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  var textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  var projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  var modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
  var normalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
  var samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

  // Habilitar os atributos
  gl.enableVertexAttribArray(vertexPositionAttribute);
  gl.enableVertexAttribArray(vertexNormalAttribute);
  gl.enableVertexAttribArray(textureCoordAttribute);

  // Ler os dados do arquivo obj
  // Esses dados podem ser obtidos de um servidor ou de um input do usuário
  // Aqui usamos um exemplo simples de um cubo com 8 vértices e 6 faces
  // var objData = await importar(new URL(`${location.origin}/source/assets/wavefront/ruby_rose/ruby_rose.obj`))
  var objData = await importar(new URL(`${path}${file}.obj`))

  // Criar os arrays para armazenar os dados do cubo
  var positions = [];
  var normals = [];
  var textureCoords = [];
  var indices = [];

  // Processar as linhas do arquivo obj
  var lines = objData.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var parts = line.split(" ");
    switch (parts[0]) {
      case "v": // Vértice
        positions.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
        break;
      case "vn": // Normal
        normals.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
        break;
      case "vt": // Coordenada de textura
        textureCoords.push(
          parseFloat(parts[1]),
          parseFloat(parts[2])
        );
        break;
      case "f": // Face
        for (var j = 1; j <= 3; j++) {
          var vertex = parts[j].split("/");
          // Os índices começam em 1, então subtraímos 1
          indices.push(
            parseInt(vertex[0]) - 1,
            parseInt(vertex[1]) - 1,
            parseInt(vertex[2]) - 1
          );
        }
        break;
    }
  }

  console.log(positions)

  // Criar os buffers para armazenar os dados na GPU
  var positionBuffer = gl.createBuffer();
  var normalBuffer = gl.createBuffer();
  var textureCoordBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();

  // Enviar os dados dos vértices para o buffer de posição
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Enviar os dados das normais para o buffer de normal
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  // Enviar os dados das coordenadas de textura para o buffer de textura
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

  // Enviar os dados dos índices para o buffer de índice
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Ler os dados do arquivo mtl
  // Esses dados podem ser obtidos de um servidor ou de um input do usuário
  // Aqui usamos um exemplo simples de um cubo com 6 materiais e 6 texturas
  // var mtlData = await importar(new URL(`${location.origin}/source/assets/wavefront/ruby_rose/ruby_rose.mtl`))
  var mtlData = await importar(`${path}${file}.mtl`)

  // Criar um objeto para armazenar os materiais e as texturas
  var materials = {};

  // Processar as linhas do arquivo mtl
  var lines = mtlData.split("\n");
  var currentMaterial = null;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var parts = line.split(" ");
    switch (parts[0]) {
      case "newmtl": // Novo material
        // Criar um objeto para armazenar as propriedades do material
        currentMaterial = {
          name: parts[1],
          ambient: null,
          diffuse: null,
          specular: null,
          shininess: null,
          texture: null
        };
        // Adicionar o material ao objeto de materiais
        materials[currentMaterial.name] = currentMaterial;
        break;
      case "Ka": // Cor ambiente
        // Armazenar a cor ambiente no material atual
        currentMaterial.ambient = [
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        ];
        break;
      case "Kd": // Cor difusa
        // Armazenar a cor difusa no material atual
        currentMaterial.diffuse = [
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
        ];
        break;
      case "Ks": // Cor especular
        // Armazenar a cor especular no material atual
        currentMaterial.specular = [
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
        ];
        break;
      case "Ns": // Brilho
        // Armazenar o brilho no material atual
        currentMaterial.shininess = parseFloat(parts[1]);
        break;
      case "map_Kd": // Mapa de textura difusa
        // Criar uma textura para o material atual
        currentMaterial.texture = gl.createTexture();
        // Carregar a imagem da textura
        var image = new Image();
        image.onload = function () {
          // Ativar a textura e vincular a imagem
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, currentMaterial.texture);
          // Enviar os dados da imagem para a textura
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          // Configurar os parâmetros da textura
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        // Definir a fonte da imagem da textura
        // image.src = new URL(`${location.origin}/source/assets/wavefront/ruby_rose/${parts[1]}`)
        image.src = new URL(`${path}${parts[1]}`)
        break;
    }
  }

  // Criar as matrizes de modelo, visão e projeção
  var modelMatrix = mat4.create();
  var viewMatrix = mat4.create();
  var projectionMatrix = mat4.create();

  // Definir a posição da câmera e o ponto de vista
  var eye = [0, 5, 0];
  var center = [0, 0, 0];
  var up = [0, 1, 0];

  // Calcular a matriz de visão usando a função lookAt
  mat4.lookAt(viewMatrix, eye, center, up);

  // Calcular a matriz de projeção usando a função perspective
  var fieldOfView = 45 * Math.PI / 180; // Em radianos
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zNear = 0.1;
  var zFar = 100.0;
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Criar uma matriz de transformação das normais
  var normalMatrix = mat3.create();

  function updateViewMatrix() {
    // Definir a posição da câmera e o ponto de vista
    var eye = [2, 2, 3]; // Você pode alterar esses valores
    var center = [0, 0, 0]; // Você pode alterar esses valores
    var up = [0, 1, 0]; // Você pode alterar esses valores

    // Calcular a matriz de visão usando a função lookAt
    mat4.lookAt(viewMatrix, eye, center, up);

    // Enviar a matriz de visão para o shader
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, viewMatrix);
  }

  // Definir a função de animação
  function animate() {
    // Atualizar a matriz de modelo com uma rotação
    var angle = performance.now() / 10000; // Em segundos
    mat4.rotate(modelMatrix, modelMatrix, angle, [0, 1, 0]);

    // Calcular a matriz de transformação das normais
    mat3.normalFromMat4(normalMatrix, modelMatrix);

    // Enviar as matrizes para os shaders
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix3fv(normalMatrixUniform, false, normalMatrix);

    // Atualizar a matriz de visão
    updateViewMatrix();

    // Associar os buffers aos atributos dos shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    // Desenhar o cubo usando os índices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Solicitar o próximo quadro de animação
    requestAnimationFrame(animate);
  }

  // Iniciar a animação
  animate();
}
// executar()


async function exemplo2() {
  // Cria o contexto a partir do elemento canvas
  var gl = canvas.getContext("webgl");
  const model = new Wavefront(gl, new URL(`${location.origin}/source/assets/wavefront/cube/cube.obj`))

  // Estabelece as propriedades básicas
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Pega o texto dos shaders, como string
  var vertex = document.getElementById("vertex-shader").textContent;
  var fragment = document.getElementById("fragment-shader").textContent;

  // Cria o programa, compilando e linkando os shaders
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertex);
  gl.compileShader(vs);

  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragment);
  gl.compileShader(fs);

  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  // Usa o programa (pode ter mais de um, e usar ora um ora outros)
  gl.useProgram(program);

  console.log(gl, program)

  // Cria a geometria e suas cores; nesse exemplo, dois triângulos
  var triangulos = [[1, 0, 0], [0, 1, 0], [-1, 0, 0],
  [1, -1, 0.2], [0, 0, 0.3], [-1, -1, 0.2]];

  var cores = [[1, 0, 0], [0, 1, 0], [0, 0, 1],
  [1, 1, 0], [0, 1, 1], [1, 0, 1]];

  var floats = new Float32Array(triangulos.length * 3);
  var floats2 = new Float32Array(triangulos.length * 3);
  for (var i = 0; i < triangulos.length; i++) {
    for (var t = 0; t < 3; t++) {
      floats[3 * i + t] = triangulos[i][t];
      floats2[3 * i + t] = cores[i][t];
    }
  }

  console.log(floats)

  // Cria o buffer e manda os dados pra GPU
  var pBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, floats, gl.STATIC_DRAW);

  // Associa esse buffer com uma variável do seu vertex shader
  var vPos = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);

  // Idem, para as cores dos vértices
  var pBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer2);
  gl.bufferData(gl.ARRAY_BUFFER, floats2, gl.STATIC_DRAW);
  var vCor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vCor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vCor);

  // Para girar o triângulo em torno do eixo Y
  var rotacaoLoc = gl.getUniformLocation(program, "rotacao");

  // Projeção em perspectiva (fonte: http://stackoverflow.com/a/30429728/520779)
  function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
    dst = dst || new Float32Array(16);

    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
    var rangeInv = 1.0 / (zNear - zFar);

    dst[0] = f / aspect; dst[1] = 0; dst[2] = 0; dst[3] = 0;
    dst[4] = 0; dst[5] = f; dst[6] = 0; dst[7] = 0;
    dst[8] = 0; dst[9] = 0; dst[10] = (zNear + zFar) * rangeInv; dst[11] = -1;
    dst[12] = 0; dst[13] = 0; dst[14] = zNear * zFar * rangeInv * 2; dst[15] = 0;

    return dst;
  }
  var perspectivaLoc = gl.getUniformLocation(program, "u_matrix");

  // Desenha
  var inicio = Date.now();
  var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(perspectivaLoc, gl.FALSE, perspective(Math.PI / 8, 1, 0.1, 10));

    gl.uniform1f(rotacaoLoc, -(Date.now() - inicio) / 500); // Gira conforme a data
    gl.drawArrays(gl.TRIANGLES, 0, triangulos.length / 2); // 1º triângulo

    gl.uniform1f(rotacaoLoc, -(Date.now() - inicio) / 900); // Gira num ritmo diferente
    gl.drawArrays(gl.TRIANGLES, triangulos.length / 2, triangulos.length / 2); // 2º triângulo

    requestAnimationFrame(render); // Chama de novo após um tempo X
  }
  render();
}

exemplo2()