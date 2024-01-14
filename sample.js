async function executar() {
  async function importar(from) {
    const response = await fetch(from)
    return await response.text()
  }

  // Obter o elemento canvas
  var canvas = document.getElementById("webgl-canvas");

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
  var objData = `
v -1.000000 -1.000000 1.000000
v 1.000000 -1.000000 1.000000
v -1.000000 1.000000 1.000000
v 1.000000 1.000000 1.000000
v -1.000000 1.000000 -1.000000
v 1.000000 1.000000 -1.000000
v -1.000000 -1.000000 -1.000000
v 1.000000 -1.000000 -1.000000
vn 0.000000 0.000000 1.000000
vn 0.000000 1.000000 0.000000
vn 0.000000 0.000000 -1.000000
vn 0.000000 -1.000000 0.000000
vn 1.000000 0.000000 0.000000
vn -1.000000 0.000000 0.000000
vt 0.000000 0.000000
vt 1.000000 0.000000
vt 0.000000 1.000000
vt 1.000000 1.000000
f 1/1/1 2/2/1 3/3/1
f 2/2/1 4/4/1 3/3/1
f 3/1/2 4/2/2 5/3/2
f 4/2/2 6/4/2 5/3/2
f 5/4/3 6/3/3 7/2/3
f 6/3/3 8/1/3 7/2/3
f 7/1/4 8/2/4 1/3/4
f 8/2/4 2/4/4 1/3/4
f 2/1/5 8/2/5 4/3/5
f 8/2/5 6/4/5 4/3/5
f 7/1/6 1/2/6 5/3/6
f 1/2/6 3/4/6 5/3/6
`;

  objData = await importar(new URL(`${location.origin}/source/assets/wavefront/ruby_rose/ruby_rose.obj`))

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

  // Carregar a imagem da textura
  var texture = gl.createTexture();
  var image = new Image();
  image.onload = function () {
    // Ativar a textura e vincular a imagem
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Enviar os dados da imagem para a textura
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Configurar os parâmetros da textura
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  };

  // Definir a fonte da imagem da textura
  image.src = "cube_texture.jpg";

  // Criar as matrizes de modelo, visão e projeção
  var modelMatrix = mat4.create();
  var viewMatrix = mat4.create();
  var projectionMatrix = mat4.create();

  // Definir a posição da câmera e o ponto de vista
  var eye = [0, 0, 5];
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
executar()