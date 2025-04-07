import { Vec2 } from "../math/vec2";
import { Matrix3 } from "../math/mat3";
import { rect, Path, toPath2D, toPoints } from "../path";
import { isPointInPolygon } from "../utils/point-in-polygon";
import { isPointInPolyline } from "../utils/point-in-polyline";
import { doPolygonsOverlap } from "../utils/polygon-overlap";
import { doPolylinesOverlap } from "../utils/polyline-overlap";
import { BoundingBox } from "../utils/bounding-box";
import { Renderable } from "./renderable";
import { Group } from "./group";

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

export class Shape implements Renderable {
  parent?: Group;

  path: Path;

  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;

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

  path2D!: Path2D;
  points!: Vec2[];
  hull: Vec2[];
  aabb: BoundingBox;

  constructor(init: ShapeInit) {
    this.path = init.path ?? [];

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 0;
    this.height = init.height ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.angle = init.angle ?? 0;

    this.fill = init.fill;
    this.stroke = init.stroke;
    this.lineWidth = init.lineWidth;
    this.lineCap = init.lineCap;
    this.lineJoin = init.lineJoin;
    this.lineDashOffset = init.lineDashOffset;
    this.miterLimit = init.miterLimit;
    this.shadowBlur = init.shadowBlur;
    this.shadowColor = init.shadowColor;
    this.shadowOffsetX = init.shadowOffsetX;
    this.shadowOffsetY = init.shadowOffsetY;

    this.hull = new Array();
    this.aabb = new BoundingBox();

    // by default, create a centered rect of width x height
    if (!init.path) {
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
    this.hull.length = this.points.length;
    this.aabb.update(this.points);
    this.width = this.aabb.width;
    this.height = this.aabb.height;
    this.update();
  }

  update() {
    this.transformation.setTransform(this);

    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i] = (this.hull[i] ?? new Vec2(0, 0))
        .copy(this.points[i])
        .transform(this.transformation);
    }

    this.aabb.update(this.hull);
  }
}
