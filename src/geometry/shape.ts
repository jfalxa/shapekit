import { v, Vec2 } from "./vec2";
import { AABB } from "../utils/aabb";
import { evenOddRule } from "../utils/even-odd-rule";
import { SAT } from "../utils/separating-axis-theorem";
import { Path } from "../utils/path";
import { Matrix3 } from "./mat3";
import { polylinesOverlap } from "../utils/polyline-overlap";

export interface ShapeInit {
  path: Path;
  x?: number;
  y?: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class Shape {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  transform = new Matrix3();
  private translation = new Vec2(0, 0);
  private scaling = new Vec2(0, 0);
  private rotation = 0;

  path: Path;
  path2D: Path2D;
  vertices: Float32Array;

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

  get angle() {
    return this.rotation;
  }

  set angle(value: number) {
    this.rotation = value;
    this.update();
  }

  constructor(shapeInit: ShapeInit) {
    this.path = shapeInit.path;
    this.path2D = this.path.toPath2D();

    const points = shapeInit.path.toPoints(shapeInit.lineWidth);
    this.vertices = new Float32Array(points.flatMap((p) => [...p]));

    this.translation[0] = shapeInit.x ?? 0;
    this.translation[1] = shapeInit.y ?? 0;
    this.scaling[0] = 1;
    this.scaling[1] = 1;
    this.rotation = shapeInit.angle ?? 0;

    this.fill = shapeInit.fill;
    this.stroke = shapeInit.stroke;
    this.lineWidth = shapeInit.lineWidth ?? 1;
    this.lineCap = shapeInit.lineCap ?? "butt";
    this.lineJoin = shapeInit.lineJoin;
    this.lineDashOffset = shapeInit.lineDashOffset;
    this.miterLimit = shapeInit.miterLimit;
    this.shadowBlur = shapeInit.shadowBlur;
    this.shadowColor = shapeInit.shadowColor;
    this.shadowOffsetX = shapeInit.shadowOffsetX;
    this.shadowOffsetY = shapeInit.shadowOffsetY;

    this.hull = points.map(v);
    this.aabb = new AABB();

    this.update();
  }

  contains(shape: Vec2 | Shape) {
    if (shape instanceof Vec2) {
      return evenOddRule(shape, this.hull);
    } else {
      for (const point of shape.hull) {
        if (!evenOddRule(point, this.hull)) return false;
      }
      return true;
    }
  }

  overlaps(shape: Shape) {
    let method = polylinesOverlap;
    if (this.fill && shape.fill) method = SAT;
    return method(this, shape) || this.contains(shape) || shape.contains(this);
  }

  update() {
    this.transform
      .identity()
      .scale(this.scaling[0], this.scaling[1])
      .rotate(this.rotation)
      .translate(this.translation[0], this.translation[1]);

    this.hull.length = this.vertices.length / 2;
    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i]
        .put(this.vertices[i * 2], this.vertices[i * 2 + 1])
        .transform(this.transform);
    }

    this.aabb.update(this.hull);
  }
}
