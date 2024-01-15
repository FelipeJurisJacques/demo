varying highp vec2 vTextureCoord;// A coordenada de textura interpolada
varying highp vec3 vLighting;// A iluminação interpolada
uniform sampler2D uSampler;// A textura do cubo

void main(void){
    // Obter a cor da textura na coordenada de textura
    highp vec4 texelColor=texture2D(uSampler,vTextureCoord);
    
    // Multiplicar a cor da textura pela iluminação
    gl_FragColor=vec4(texelColor.rgb*vLighting,texelColor.a);
}