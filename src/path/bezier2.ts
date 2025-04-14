import { Point, v, Vec2 } from "../math/vec2";
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

  apply(path: Path2D, control: Vec2 | undefined, sx: number, sy: number): void {
    const _control = this.control ?? control;
    if (!_control) throw new Error("Missing control point");
    const to = v(this.to).scale(sx, sy);
    const ct = v(_control).scale(sx, sy);
    path.quadraticCurveTo(ct.x, ct.y, to.x, to.y);
  }

  sample(
    from: Vec2,
    control: Vec2 | undefined,
    sx: number,
    sy: number
  ): Vec2[] {
    const _control = this.control ?? control;
    if (!_control) throw new Error("Missing control point");

    const p0 = v(from.scale(sx, sy));
    const p1 = v(_control).scale(sx, sy);
    const p2 = v(this.to).scale(sx, sy);

    let i = 0;
    this.points.length = this.segments + 1;

    for (let t = 0; t <= 1; t += 1 / this.segments) {
      if (!this.points[i]) this.points[i] = new Vec2(0, 0);
      Bezier2.sample(p0, p1, p2, this.segments, this.points[i++]);
    }

    return this.points;
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
