import { Node } from "vroum";
import { Render } from "./render";
import { Point, v, Vec2 } from "../geometry/vec2";
import { AABB } from "../utils/aabb";
import { evenOddRule } from "../utils/even-odd-rule";
import { SAT } from "../utils/separating-axis-theorem";

export interface ShapeInit {
  vertices: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  angle?: number;
  color?: [number, number, number, number];
}

export class Shape extends Node {
  declare parent: Render;

  color: Float32Array;

  private translation = new Float32Array(2);
  private scaling = new Float32Array(2);
  private rotation = 0;

  vertices: Float32Array;
  private numVertices: number;
  private vertexBuffer!: WebGLBuffer;

  aabb: AABB;
  hull: Vec2[];
  dirty = false;

  get x() {
    return this.translation[0];
  }

  set x(value: number) {
    this.translation[0] = value;
    this.update();
  }

  get y() {
    return this.translation[1];
  }

  set y(value: number) {
    this.translation[1] = value;
    this.update();
  }

  get width() {
    return this.scaling[0];
  }

  set width(value: number) {
    this.scaling[0] = value;
    this.update();
  }

  get height() {
    return this.scaling[1];
  }

  set height(value: number) {
    this.scaling[1] = value;
    this.update();
  }

  get angle() {
    return this.rotation;
  }

  set angle(value: number) {
    this.rotation = value;
    this.update();
  }

  constructor(shapeInit: ShapeInit) {
    super();

    const vertices = shapeInit.vertices.map((v) => [v.x, v.y]).flat();
    this.vertices = new Float32Array(vertices);
    this.numVertices = vertices.length / 2;

    this.translation[0] = shapeInit.x ?? 0;
    this.translation[1] = shapeInit.y ?? 0;
    this.scaling[0] = shapeInit.width ?? 1;
    this.scaling[1] = shapeInit.height ?? 1;
    this.rotation = shapeInit.angle ?? 0;
    this.color = new Float32Array(shapeInit.color ?? [0, 0, 0, 0]);

    this.hull = shapeInit.vertices.map(v);
    this.aabb = new AABB();

    this.update();
  }

  contains(point: Vec2) {
    return evenOddRule(point, this.hull);
  }

  overlaps(shape: Shape) {
    return SAT(this.hull, shape.hull);
  }

  update() {
    this.hull.length = this.vertices.length / 2;
    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i]
        .set(this.vertices[i * 2], this.vertices[i * 2 + 1])
        .scale(this.width, this.height)
        .rotate(this.angle)
        .add(this);
    }
    this.aabb.update(this.hull);
  }

  bind(webgl: Render) {
    this.connect(webgl);

    const { gl } = this.parent;
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  render() {
    const { gl, program } = this.parent;
    const { aPosition, uTranslation, uScale, uRotation, uColor } = program;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2fv(uTranslation, this.translation);
    gl.uniform2fv(uScale, this.scaling);
    gl.uniform1f(uRotation, this.angle);
    gl.uniform4fv(uColor, this.color);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.numVertices);
  }
}
