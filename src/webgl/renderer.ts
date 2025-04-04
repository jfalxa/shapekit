import { Loop, Task } from "vroum";
import { Program } from "./program";
import { Shape } from "../geometry/shape";
import { toRGBA } from "../utils/rgba";

export class Renderer extends Task {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: Program;
  projectionMatrix: Float32Array;

  shapes: Shape[] = [];

  vertexBuffers = new Map<Shape, WebGLBuffer>();

  // Helper: initialize WebGL context on a given canvas
  constructor(canvas: HTMLCanvasElement, loop: Loop) {
    super(loop);

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL not supported in your browser");

    this.canvas = canvas;
    this.gl = gl;
    this.program = new Program(gl);
    this.projectionMatrix = this.computeProjectionMatrix(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  computeProjectionMatrix(canvas: HTMLCanvasElement) {
    const w = 2 / canvas.width;
    const h = -2 / canvas.height;
    // prettier-ignore
    return new Float32Array([
      w, 0, 0, 0,
      0, h, 0, 0,
      0, 0, 1, 0,
     -1, 1, 0, 1
    ]);
  }

  tick() {
    const { gl, program, projectionMatrix } = this;
    const { uProjection } = program;

    program.use();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(uProjection, false, projectionMatrix);

    for (let i = 0; i < this.shapes.length; i++) {
      this.render(this.shapes[i]);
    }
  }

  add(...shapes: Shape[]) {
    this.shapes.push(...shapes);
    for (const shape of shapes) {
      const { gl } = this;
      const vertexBuffer = gl.createBuffer();
      this.vertexBuffers.set(shape, vertexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);
    }
  }

  render(shape: Shape) {
    const { gl, program } = this;
    const { aPosition, uTransform, uColor } = program;

    const vertexBuffer = this.vertexBuffers.get(shape)!;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix3fv(uTransform, false, shape.transform);
    gl.uniform4fv(uColor, toRGBA(shape.fill ?? "transparent"));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.vertices.length / 2);
  }
}

/*
// INSTANCING


// Helper: Create an instanced attribute buffer with provided data (for per-instance attributes)
function createInstancedBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Using DYNAMIC_DRAW so that you can update the buffer if needed.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
  return buffer;
}

// Helper: Update an existing instanced buffer with new data
function updateInstancedBuffer(gl, buffer, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(data));
}

// Helper: Setup an instanced attribute for per-instance data.
// `attribName` is the attribute name in your shader.
// `size` is the number of components (e.g., 2 for a vec2).
// `divisor` indicates that the attribute advances once per instance.
function setupInstancedAttribute(
  gl,
  program,
  attribName,
  buffer,
  size,
  type = gl.FLOAT,
  normalized = false,
  stride = 0,
  offset = 0,
  divisor = 1
) {
  const location = gl.getAttribLocation(program, attribName);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, type, normalized, stride, offset);

  // WebGL2 native API
  if (gl instanceof WebGL2RenderingContext) {
    gl.vertexAttribDivisor(location, divisor);
  } else {
    // For WebGL1, use the ANGLE_instanced_arrays extension
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    if (!ext) {
      throw new Error("Instanced arrays not supported in this browser.");
    }
    ext.vertexAttribDivisorANGLE(location, divisor);
  }
}

// Helper: Draw shapes with instancing.
// `mode` is the drawing mode (e.g., gl.TRIANGLE_FAN or gl.TRIANGLES),
// `count` is the number of vertices per shape,
// `instanceCount` is the number of instances to draw.
function drawInstancedShapes(gl, mode, count, instanceCount) {
  if (gl instanceof WebGL2RenderingContext) {
    gl.drawArraysInstanced(mode, 0, count, instanceCount);
  } else {
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    if (!ext) {
      throw new Error("Instanced arrays not supported in this browser.");
    }
    ext.drawArraysInstancedANGLE(mode, 0, count, instanceCount);
  }
}

*/
