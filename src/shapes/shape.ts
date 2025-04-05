import { Vec2 } from "../math/vec2";
import { Matrix3 } from "../math/mat3";
import { BoundingBox } from "../utils/bounding-box";
import { Path } from "../utils/path";
import { isPointInPolygon } from "../utils/point-in-polygon";
import { isPointInPolyline } from "../utils/point-in-polyline";
import { doPolygonsOverlap } from "../utils/polygon-overlap";
import { doPolylinesOverlap } from "../utils/polyline-overlap";
import { toPath2D, toPoints } from "../utils/path-converter";

export interface ShapeInit {
  path?: Path;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
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

  private dimensions = new Vec2(0, 0);
  private translation = new Vec2(0, 0);
  private scaling = new Vec2(0, 0);
  private rotation = 0;

  transformation = new Matrix3();

  path: Path;
  path2D!: Path2D;
  vertices!: Float32Array;
  hull: Vec2[];
  aabb: BoundingBox;
  bb: BoundingBox;
  dirty = false;

  get x() {
    return this.translation[0];
  }
  set x(value: number) {
    this.translation[0] = value;
    this.transform();
  }

  get y() {
    return this.translation[1];
  }
  set y(value: number) {
    this.translation[1] = value;
    this.transform();
  }

  get width() {
    return this.dimensions[0];
  }
  set width(value: number) {
    this.dimensions[0] = value;
    this.transform();
  }

  get height() {
    return this.dimensions[1];
  }
  set height(value: number) {
    this.dimensions[1] = value;
    this.transform();
  }

  get angle() {
    return this.rotation;
  }
  set angle(value: number) {
    this.rotation = value;
    this.transform();
  }

  constructor(shapeInit: ShapeInit) {
    this.path = shapeInit.path ?? new Path();

    this.dimensions.x = shapeInit.width ?? 0;
    this.dimensions.y = shapeInit.height ?? 0;
    this.translation[0] = shapeInit.x ?? 0;
    this.translation[1] = shapeInit.y ?? 0;
    this.scaling[0] = 1;
    this.scaling[1] = 1;
    this.rotation = shapeInit.angle ?? 0;

    if (this.path.segments.length === 0) {
      if (this.width && this.height) {
        this.path = new Path().rect(0, 0, this.width, this.height);
      }
    }

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
    let points = toPoints(this.path);
    this.path2D = toPath2D(this.path);
    this.vertices = new Float32Array(points.flatMap((p) => [...p]));
    this.bb.update(points);
    this.transform();
  }

  transform() {
    const ratioX = this.width ? this.width / this.bb.width : 1;
    const ratioY = this.height ? this.height / this.bb.height : 1;

    this.transformation
      .identity()
      .scale(this.scaling[0] * ratioX, this.scaling[1] * ratioY)
      .rotate(this.rotation)
      .translate(this.translation[0], this.translation[1]);

    // prepare the hull array to hold the transformed vertices
    this.hull.length = this.vertices.length / 2;

    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i] = (this.hull[i] ?? new Vec2(0, 0))
        .put(this.vertices[i * 2], this.vertices[i * 2 + 1])
        .transform(this.transformation);
    }

    this.aabb.update(this.hull);
  }
}
