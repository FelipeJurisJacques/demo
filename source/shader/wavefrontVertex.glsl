attribute vec3 aVertexPosition;// A posição do vértice
attribute vec3 aVertexNormal;// A normal do vértice
attribute vec2 aTextureCoord;// A coordenada de textura do vértice

uniform mat4 uModelViewMatrix;// A matriz de modelo e visão
uniform mat4 uProjectionMatrix;// A matriz de projeção
uniform mat3 uNormalMatrix;// A matriz de transformação das normais

varying highp vec2 vTextureCoord;// A coordenada de textura interpolada
varying highp vec3 vLighting;// A iluminação interpolada

void main(void){
  // Calcular a posição do vértice projetada no espaço de tela
  gl_Position=uProjectionMatrix*uModelViewMatrix*vec4(aVertexPosition,1.);
  
  // Passar a coordenada de textura para o shader de fragmento
  vTextureCoord=aTextureCoord;
  
  // Aplicar a transformação das normais
  highp vec3 transformedNormal=uNormalMatrix*aVertexNormal;
  
  // Calcular a iluminação usando uma fonte de luz direcional
  highp vec3 lightDirection=normalize(vec3(-.5,-.5,-.5));
  highp float directionalLightWeighting=max(dot(transformedNormal,lightDirection),0.);
  vLighting=vec3(.2,.2,.2)+vec3(.8,.8,.8)*directionalLightWeighting;
}