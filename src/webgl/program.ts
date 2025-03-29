export class Program {
  // Vertex shader: transforms 2D vertices using per-shape uniforms
  static vertexShader = `
    attribute vec2 aPosition;
    uniform mat3 uTransform;
    uniform mat4 uProjection;

    void main() {
      vec3 pos = uTransform * vec3(aPosition, 1.0);
      gl_Position = uProjection * vec4(pos.xy, 0.0, 1.0);
    }
  `;

  // Fragment shader: simply fills with a color
  static fragmentShader = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main() {
      gl_FragColor = uColor;
    }
  `;

  gl: WebGL2RenderingContext;
  program: WebGLProgram;

  aPosition: GLint;
  uProjection: WebGLUniformLocation;
  uTransform: WebGLUniformLocation;
  uColor: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    const program = this.createProgram(gl);

    this.gl = gl;
    this.program = program;

    this.aPosition = gl.getAttribLocation(program, "aPosition");
    this.uProjection = gl.getUniformLocation(program, "uProjection")!;
    this.uTransform = gl.getUniformLocation(program, "uTransform")!;
    this.uColor = gl.getUniformLocation(program, "uColor")!;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  // Helper: create a shader program from vertex and fragment shader sources
  createProgram(gl: WebGL2RenderingContext) {
    const vertexShader = this.compileShader(gl, Program.vertexShader, gl.VERTEX_SHADER); // prettier-ignore
    const fragmentShader = this.compileShader(gl, Program.fragmentShader, gl.FRAGMENT_SHADER); // prettier-ignore

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Could not link program:\n${info}`);
    }

    return program;
  }

  // Helper: compile a shader of given type from source code
  compileShader(gl: WebGL2RenderingContext, source: string, type: number) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Could not create shader");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Could not compile shader:\n${info}`);
    }

    return shader;
  }
}
