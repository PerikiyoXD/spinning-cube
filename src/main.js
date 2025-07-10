import vert from './shader.vert';
import frag from './shader.frag';

// Create full-screen canvas
const canvas = document.createElement('canvas');
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');
if (!gl) {
  alert('WebGL2 is not supported in this browser.');
  throw new Error('WebGL2 not supported.');
}
console.log('[GL] WebGL2 context acquired:', gl.getParameter(gl.VERSION));

// Background color
gl.clearColor(0.05, 0.07, 0.1, 1.0);

// Compile shader
function compileShader(type, src, label) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    console.error(`[GLSL] Failed to compile ${label}:\n`, log);
    throw new Error(log);
  }
  console.log(`[GLSL] Compiled ${label} OK`);
  return s;
}

const vs = compileShader(gl.VERTEX_SHADER, vert, 'vertex shader');
const fs = compileShader(gl.FRAGMENT_SHADER, frag, 'fragment shader');

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const log = gl.getProgramInfoLog(program);
  console.error('[GLSL] Program linking failed:\n', log);
  throw new Error(log);
}
console.log('[GLSL] Shader program linked successfully');
gl.useProgram(program);

// Quad vertex buffer
const position = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, position);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,  1, -1,  -1, 1,
   1, -1,  1,  1,  -1, 1,
]), gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(program, 'position');
if (posLoc === -1) {
  console.error('[GLSL] Attribute "position" not found.');
  throw new Error('Missing attribute');
}
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// Uniforms
const timeLoc = gl.getUniformLocation(program, 'u_time');
const resLoc = gl.getUniformLocation(program, 'u_resolution');

// Resize handler
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth * dpr;
  const h = window.innerHeight * dpr;
  canvas.width = w;
  canvas.height = h;
  gl.viewport(0, 0, w, h);
  gl.uniform2f(resLoc, w, h);
  console.log('[GL] Resized to', w, 'x', h);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial resize

// Render loop
function render(t) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(timeLoc, t * 0.001);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}
console.log('[GL] Starting render loop');
requestAnimationFrame(render);
