import { Point, v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { solveQuadratic } from "../utils/quadratic";
import { Segment } from "./segment";

export function bezier3(
  x: number,
  y: number,
  sx: number,
  sy: number,
  ex?: number,
  ey?: number,
  segments = 10
) {
  return new Bezier3(x, y, sx, sy, ex, ey, segments);
}

export class Bezier3 extends Segment {
  start: Vec2 | undefined;
  end: Vec2;

  constructor(
    x: number,
    y: number,
    sx: number,
    sy: number,
    ex?: number,
    ey?: number,
    segments = 10
  ) {
    super(x, y, segments);

    if (ex !== undefined && ey !== undefined) {
      this.start = new Vec2(sx, sy);
      this.end = new Vec2(ex, ey);
    } else {
      this.end = new Vec2(sx, sy);
    }
  }

  getOptionalControl() {
    return this.start;
  }

  getSharedControl() {
    return this.end;
  }

  apply(path: Path2D, control: Vec2 | undefined, sx: number, sy: number) {
    const _start = this.start ?? control;
    if (!_start) throw new Error("Missing start control point");

    const to = v(this.to).scale(sx, sy);
    const start = v(_start).scale(sx, sy);
    const end = v(this.end).scale(sx, sy);

    path.bezierCurveTo(start.x, start.y, end.x, end.y, to.x, to.y);
  }

  sample(
    from: Vec2,
    control: Vec2 | undefined,
    sx: number,
    sy: number
  ): Vec2[] {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    const p0 = v(from).scale(sx, sy);
    const p1 = v(start).scale(sx, sy);
    const p2 = v(this.end).scale(sx, sy);
    const p3 = v(this.to).scale(sx, sy);

    let i = 0;
    const step = 1 / this.segments;
    this.points.length = this.segments + 1;

    for (let t = 0; t <= 1; t += step) {
      if (!this.points[i]) this.points[i] = new Vec2(0, 0);
      Bezier3.sample(p0, p1, p2, p3, t, this.points[i++]);
    }

    return this.points;
  }

  join(aabb: BoundingBox, from: Vec2, _control: Vec2 | undefined): void {
    const p0 = from;
    const p1 = this.start ?? _control;
    if (!p1) throw new Error("Missing start control point");
    const p2 = this.end;
    const p3 = this.to;

    this.min.put(Infinity);
    this.max.put(-Infinity);

    this.min.min(p0).min(p3);
    this.max.max(p0).max(p3);

    const point = new Vec2(0, 0);

    const ax = -p0.x + 3 * p1.x - 3 * p2.x + p3.x;
    const bx = 2 * (p0.x - 2 * p1.x + p2.x);
    const cx = -p0.x + p1.x;

    for (const t of solveQuadratic(ax, bx, cx)) {
      if (t > 0 && t < 1) {
        Bezier3.sample(p0, p1, p2, p3, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    const ay = -p0.y + 3 * p1.y - 3 * p2.y + p3.y;
    const by = 2 * (p0.y - 2 * p1.y + p2.y);
    const cy = -p0.y + p1.y;

    for (const t of solveQuadratic(ay, by, cy)) {
      if (t > 0 && t < 1) {
        Bezier3.sample(p0, p1, p2, p3, t, point);
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
    p3: Point,
    t: number,
    out = new Vec2(0, 0)
  ) {
    out.x =
      (1 - t) ** 3 * p0.x +
      3 * (1 - t) ** 2 * t * p1.x +
      3 * (1 - t) * t ** 2 * p2.x +
      t ** 3 * p3.x;

    out.y =
      (1 - t) ** 3 * p0.y +
      3 * (1 - t) ** 2 * t * p1.y +
      3 * (1 - t) * t ** 2 * p2.y +
      t ** 3 * p3.y;

    return out;
  }
}
