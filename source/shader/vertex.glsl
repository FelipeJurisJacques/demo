attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}

// void main() {
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x+10.0, position.y, position.z+5.0, 1.0);
// }
