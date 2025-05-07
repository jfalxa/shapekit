import { Point, Vec2 } from "../math/vec2";
import { rect } from "../paths/rect";
import { isPointInPolyline, doPolylinesOverlap } from "../utils/polyline";
import { isPointInPolygon, doPolygonsOverlap } from "../utils/polygon";
import { Renderable, RenderableInit } from "./renderable";
import { Path, PathLike } from "../paths/path";
import { Style } from "../styles/style";

export interface ShapeStyle {
  fill?: Style;
  stroke?: Style;
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
}

export interface ShapeInit extends RenderableInit, ShapeStyle {
  path?: PathLike;
  quality?: number;
}

export class Shape extends Renderable {
  path: Path;
  quality: number;

  fill?: Style;
  stroke?: Style;
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

  points: Vec2[];

  constructor(init: ShapeInit) {
    // by default, create a rect of width x height
    if (!init.path && init.width !== undefined && init.height !== undefined) {
      init.path = [rect(0, 0, init.width, init.height)];
    }

    super(init);

    this.path = new Path(init.path ?? [], init.quality);

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
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

    this.points = new Array(this.path.points.length);

    this.width = this.baseWidth = this.path.obb.width;
    this.height = this.baseHeight = this.path.obb.height;

    this.update(false, false);
  }

  contains(shape: Point | Shape) {
    if (!this.obb.contains(shape)) return false;

    if (!(shape instanceof Shape)) {
      if (this.fill && isPointInPolygon(shape, this)) return true;
      if (this.stroke && isPointInPolyline(shape, this)) return true;
      return false;
    }

    for (const point of shape.points) {
      if (!this.contains(point)) return false;
    }

    return true;
  }

  overlaps(shape: Shape) {
    if (!this.obb.overlaps(shape)) return false;
    if (this.fill && shape.fill && doPolygonsOverlap(shape, this)) return true;
    if (doPolylinesOverlap(shape, this)) return true;
    return shape.contains(this) || this.contains(shape);
  }

  build() {
    const sx = this.baseWidth !== 0 ? this.width / this.baseWidth : 1;
    const sy = this.baseHeight !== 0 ? this.height / this.baseHeight : 1;
    if (sx !== 1 || sy !== 1) this.path.scale(sx, sy);

    this.path.build(this.quality);

    this.points.length = this.path.points.length;
    this.width = this.baseWidth = this.path.obb.width;
    this.height = this.baseHeight = this.path.obb.height;
  }

  update(rebuild?: boolean, updateParent = true) {
    super.update(rebuild);

    this.obb.copy(this.path.obb).transform(this.transform);

    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = (this.points[i] ?? new Vec2(0, 0))
        .copy(this.path.points[i])
        .transform(this.transform);
    }

    if (updateParent) {
      this.parent?.update(false, true, false);
    }
  }
}
