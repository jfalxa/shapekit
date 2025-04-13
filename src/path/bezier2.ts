import { Point, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export function bezier2(
  x: number,
  y: number,
  cx?: number,
  cy?: number,
  segments = 10
) {
  return new Bezier2(x, y, cx, cy, segments);
}

export class Bezier2 extends Segment {
  control: Vec2 | undefined;

  constructor(x: number, y: number, cx?: number, cy?: number, segments = 10) {
    super(x, y, segments);

    if (cx !== undefined && cy !== undefined) {
      this.control = new Vec2(cx, cy);
    }
  }

  getOptionalControl() {
    return this.control;
  }

  getSharedControl() {
    return this.control;
  }

  scale(sx: number, sy: number): void {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
  }

  apply(path: Path2D, control?: Vec2): void {
    const _control = this.control ?? control;
    if (!_control) throw new Error("Missing control point");
    path.quadraticCurveTo(_control.x, _control.y, this.to.x, this.to.y);
  }

  join(aabb: BoundingBox, from: Vec2, _control: Vec2 | undefined) {
    const p0 = from;
    const p1 = this.control ?? this.control;
    if (!p1) throw new Error("Control point is missing");
    const p2 = this.to;

    this.min.put(Infinity);
    this.max.put(-Infinity);

    this.min.min(p0).min(p2);
    this.max.max(p0).max(p2);

    const point = new Vec2(0, 0);

    const denomX = p2.x - 2 * p1.x + p0.x;
    if (denomX !== 0) {
      const t = (p0.x - p1.x) / denomX;
      if (t > 0 && t < 1) {
        Bezier2.sample(p0, p1, p2, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    const denomY = p2.y - 2 * p1.y + p0.y;
    if (denomY !== 0) {
      const t = (p0.y - p1.y) / denomY;
      if (t > 0 && t < 1) {
        Bezier2.sample(p0, p1, p2, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    aabb.merge(this);
  }

  sample(from: Vec2, control?: Vec2): Vec2[] {
    const _control = this.control ?? control;
    if (!_control) throw new Error("Missing control point");

    let i = 0;
    this.points.length = this.segments + 1;

    for (let t = 0; t <= 1; t += 1 / this.segments) {
      if (!this.points[i]) this.points[i] = new Vec2(0, 0);
      Bezier2.sample(from, _control, this.to, this.segments, this.points[i++]);
    }

    return this.points;
  }

  static sample(
    p0: Point,
    p1: Point,
    p2: Point,
    t: number,
    out = new Vec2(0, 0)
  ) {
    out.x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    out.y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return out;
  }
}
