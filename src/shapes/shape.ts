import { Point, Vec2 } from "../math/vec2";
import { rect, Path, toPath2D, toPoints } from "../path";
import { isPointInPolygon } from "../utils/point-in-polygon";
import { isPointInPolyline } from "../utils/point-in-polyline";
import { doPolygonsOverlap } from "../utils/polygon-overlap";
import { doPolylinesOverlap } from "../utils/polyline-overlap";
import { Renderable, RenderableInit } from "./renderable";

export interface ShapeInit extends RenderableInit {
  path?: Path;
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

export class Shape extends Renderable {
  path: Path;

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

  path2D!: Path2D;
  points!: Vec2[];
  hull: Vec2[];

  constructor(init: ShapeInit) {
    // by default, create a centered rect of width x height
    if (!init.path && init.width !== undefined && init.height !== undefined) {
      init.path = rect(0, 0, init.width, init.height);
    }

    super(init);

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

    this.update(true);
  }

  contains(shape: Point | Shape) {
    if (!this.obb.mayContain(shape)) return false;

    if (shape instanceof Shape) {
      for (const point of shape.hull) {
        if (!this.contains(point)) return false;
      }
      return true;
    }

    if (this.fill && isPointInPolygon(shape, this)) return true;
    if (this.stroke && isPointInPolyline(shape, this)) return true;

    return false;
  }

  overlaps(shape: Shape) {
    if (!this.obb.mayOverlap(shape)) return false;
    if (this.fill && shape.fill && doPolygonsOverlap(shape, this)) return true;
    if (doPolylinesOverlap(shape, this)) return true;
    return shape.contains(this) || this.contains(shape);
  }

  update(rebuild = false) {
    if (rebuild) {
      const { width, height, _obb: box, lineWidth: lw = 0 } = this;

      if (width && height && box.width && box.height) {
        if (width !== box.width || height !== box.height) {
          const sx = (width - lw) / (box.width - lw);
          const sy = (height - lw) / (box.height - lw);
          for (const segment of this.path) segment.scale(sx, sy);
        }
      }

      this.path2D = toPath2D(this.path);
      this.points = toPoints(this.path);
      this.hull.length = this.points.length;
      this._obb.fit(this.points, this.lineWidth);
      this.width = this._obb.width;
      this.height = this._obb.height;
    }

    this.transformation.setTransform(this);
    if (this.parent) this.transformation.transform(this.parent.transformation);

    this.obb.copy(this._obb).transform(this.transformation);

    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i] = (this.hull[i] ?? new Vec2(0, 0))
        .copy(this.points[i])
        .transform(this.transformation);
    }
  }
}
