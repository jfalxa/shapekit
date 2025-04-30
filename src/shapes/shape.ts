import { Point, Vec2 } from "../math/vec2";
import { rect, Path, buildPath } from "../path";
import { BoundingBox } from "../utils/bounding-box";
import { isPointInPolyline, doPolylinesOverlap } from "../utils/polyline";
import { isPointInPolygon, doPolygonsOverlap } from "../utils/polygon";
import { Renderable, RenderableInit } from "./renderable";
import { Gradient } from "../gradients";

export interface ShapeInit extends RenderableInit {
  path?: Path;
  fill?: string | Gradient;
  stroke?: string | Gradient;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalAlpha?: number;
  filter?: string;
  quality?: number;
}

export class Shape extends Renderable {
  path: Path;
  quality: number;

  fill?: string | Gradient;
  stroke?: string | Gradient;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalAlpha?: number;
  filter?: string;

  path2D!: Path2D;
  hull: Vec2[];

  _hull: Vec2[]; // local unstransformed hull
  _obb: BoundingBox; // local unstransformed OBB

  constructor(init: ShapeInit) {
    // by default, create a rect of width x height
    if (!init.path && init.width !== undefined && init.height !== undefined) {
      init.path = [rect(0, 0, init.width, init.height)];
    }

    super(init);

    this.path = init.path ?? [];

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 0;
    this.height = init.height ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.rotation = init.rotation ?? 0;

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
    this.globalAlpha = init.globalAlpha;
    this.filter = init.filter;
    this.quality = init.quality ?? 1;

    this.hull = new Array();

    this._obb = new BoundingBox();
    this._hull = new Array();

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

  build() {
    const { width, height, baseWidth, baseHeight } = this;
    const { path, quality, _hull, _obb } = this;

    if (width && height && baseWidth && baseHeight) {
      const sw = width / baseWidth;
      const sh = height / baseHeight;

      for (const segment of this.path) {
        segment.scale(sw, sh);
      }
    }

    this.path2D = buildPath(path, _hull, _obb, quality);

    this.width = this.baseWidth = _obb.width;
    this.height = this.baseHeight = _obb.height;

    this.hull.length = _hull.length;
  }

  update(rebuild = false) {
    super.update(rebuild);

    this.obb.copy(this._obb).transform(this.transform);

    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i] = (this.hull[i] ?? new Vec2(0, 0))
        .copy(this._hull[i])
        .transform(this.transform);
    }
  }
}
