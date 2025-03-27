export class Program {
  // Vertex shader: transforms 2D vertices using per-shape uniforms
  static vertexShader = `
    attribute vec2 aPosition;

    // Transformation uniforms:
    // uTranslation: translation in pixel coordinates (relative to the top-left corner)
    // uScale: scale factor for the shape
    // uRotation: rotation in radians (applied around the local origin)
    uniform vec2 uTranslation;
    uniform float uRotation;
    uniform vec2 uScale;

    // Projection matrix to convert from pixel space to clip space
    uniform mat4 uProjection;
        
    void main() {
      // Apply scaling in pixel space first
      vec2 scaled = aPosition * uScale;
      
      // Compute rotation on the scaled coordinate
      float cosR = cos(uRotation);
      float sinR = sin(uRotation);
      vec2 rotated = vec2(
        scaled.x * cosR - scaled.y * sinR,
        scaled.x * sinR + scaled.y * cosR
      );
      
      // Apply translation
      vec2 transformed = rotated + uTranslation;
      
      // Convert the 2D pixel coordinate into clip space using the projection matrix
      gl_Position = uProjection * vec4(transformed, 0.0, 1.0);
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
  uTranslation: WebGLUniformLocation;
  uRotation: WebGLUniformLocation;
  uScale: WebGLUniformLocation;
  uColor: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    const program = this.createProgram(gl);

    this.gl = gl;
    this.program = program;

    this.aPosition = gl.getAttribLocation(program, "aPosition");
    this.uProjection = gl.getUniformLocation(program, "uProjection")!;
    this.uTranslation = gl.getUniformLocation(program, "uTranslation")!;
    this.uRotation = gl.getUniformLocation(program, "uRotation")!;
    this.uScale = gl.getUniformLocation(program, "uScale")!;
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
