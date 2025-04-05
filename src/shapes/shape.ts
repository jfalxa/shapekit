import { Vec2 } from "../math/vec2";
import { Matrix3 } from "../math/mat3";
import { BoundingBox } from "../utils/bounding-box";
import { isPointInPolygon } from "../utils/point-in-polygon";
import { isPointInPolyline } from "../utils/point-in-polyline";
import { doPolygonsOverlap } from "../utils/polygon-overlap";
import { doPolylinesOverlap } from "../utils/polyline-overlap";
import { rect, Path, toPath2D, toPoints } from "../path";

export interface ShapeInit {
  path?: Path;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
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

  transformation = new Matrix3();

  path: Path;
  hull: Vec2[];
  aabb: BoundingBox;
  bb: BoundingBox;

  path2D!: Path2D;
  points!: Vec2[];

  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;

  constructor(shapeInit: ShapeInit) {
    this.path = shapeInit.path ?? [];

    this.x = shapeInit.x ?? 0;
    this.y = shapeInit.y ?? 0;
    this.width = shapeInit.width ?? 0;
    this.height = shapeInit.height ?? 0;
    this.scaleX = shapeInit.scaleX ?? 1;
    this.scaleY = shapeInit.scaleY ?? 1;
    this.angle = shapeInit.angle ?? 0;

    this.fill = shapeInit.fill;
    this.stroke = shapeInit.stroke;
    this.lineWidth = shapeInit.lineWidth;
    this.lineCap = shapeInit.lineCap;
    this.lineJoin = shapeInit.lineJoin;
    this.lineDashOffset = shapeInit.lineDashOffset;
    this.miterLimit = shapeInit.miterLimit;
    this.shadowBlur = shapeInit.shadowBlur;
    this.shadowColor = shapeInit.shadowColor;
    this.shadowOffsetX = shapeInit.shadowOffsetX;
    this.shadowOffsetY = shapeInit.shadowOffsetY;

    this.bb = new BoundingBox();
    this.aabb = new BoundingBox();
    this.hull = new Array();

    // by default, create a centered rect of width x height
    if (!shapeInit.path) {
      if (this.width && this.height) {
        this.path = rect(0, 0, this.width, this.height);
      }
    }

    this.build();
  }

  contains(shape: Vec2 | Shape) {
    if (shape instanceof Vec2) {
      if (this.fill && isPointInPolygon(shape, this)) return true;
      if (this.stroke && isPointInPolyline(shape, this)) return true;
      return false;
    }

    for (const point of shape.hull) {
      if (!this.contains(point)) return false;
    }

    return true;
  }

  overlaps(shape: Shape) {
    if (this.fill && shape.fill && doPolygonsOverlap(this, shape)) return true;
    if (doPolylinesOverlap(this, shape)) return true;
    return this.contains(shape) || shape.contains(this);
  }

  build() {
    this.path2D = toPath2D(this.path);
    this.points = toPoints(this.path);
    this.bb.update(this.points);
    this.update();
  }

  update() {
    const ratioX = this.width ? this.width / this.bb.width : 1;
    const ratioY = this.height ? this.height / this.bb.height : 1;

    this.transformation
      .identity()
      .scale(this.scaleX * ratioX, this.scaleY * ratioY)
      .rotate(this.angle)
      .translate(this.x, this.y);

    this.hull.length = this.points.length;

    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i] = (this.hull[i] ?? new Vec2(0, 0))
        .copy(this.points[i])
        .transform(this.transformation);
    }

    this.aabb.update(this.hull);
  }
}
