import { Point, v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { solveQuadratic } from "../math/solver";
import { Segment } from "./segment";
import { pointToLineDistance } from "../utils/polyline";

export function bezier3(
  x: number,
  y: number,
  sx: number,
  sy: number,
  ex?: number,
  ey?: number
) {
  return new Bezier3(x, y, sx, sy, ex, ey);
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
    ey?: number
  ) {
    super(x, y);

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

    const p1 = v(_start).scale(sx, sy);
    const p2 = v(this.end).scale(sx, sy);
    const p3 = v(this.to).scale(sx, sy);

    path.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  }

  sample(
    from: Vec2,
    control: Vec2 | undefined,
    sx: number,
    sy: number,
    quality: number
  ): Vec2[] {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    const p0 = v(from).scale(sx, sy);
    const p1 = v(start).scale(sx, sy);
    const p2 = v(this.end).scale(sx, sy);
    const p3 = v(this.to).scale(sx, sy);

    return Bezier3.adaptiveSample(p0, p1, p2, p3, quality);
  }

  join(
    aabb: BoundingBox,
    from: Vec2,
    control: Vec2 | undefined,
    sx: number,
    sy: number
  ): void {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    const p0 = v(from).scale(sx, sy);
    const p1 = v(start).scale(sx, sy);
    const p2 = v(this.end).scale(sx, sy);
    const p3 = v(this.to).scale(sx, sy);

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

  static adaptiveSample(
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point,
    quality: number,
    out: Vec2[] = []
  ) {
    let i = 0;
    const tolerance = 1 / quality;
    const stack = [{ a: p0, b: p1, c: p2, d: p3 }];

    while (stack.length > 0) {
      const { a, b, c, d } = stack.pop()!;

      const midCurve = Bezier3.sample(a, b, c, d, 0.5);
      const error = pointToLineDistance(midCurve, a, d);

      if (error <= tolerance) {
        if (!out[i]) out[i] = new Vec2(0, 0);
        out[i++].put(d.x, d.y);
      } else {
        // de Casteljau subdivision
        const ab = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const bc = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
        const cd = { x: (c.x + d.x) / 2, y: (c.y + d.y) / 2 };
        const abc = { x: (ab.x + bc.x) / 2, y: (ab.y + bc.y) / 2 };
        const bcd = { x: (bc.x + cd.x) / 2, y: (bc.y + cd.y) / 2 };
        const abcd = { x: (abc.x + bcd.x) / 2, y: (abc.y + bcd.y) / 2 };

        stack.push({ a: abcd, b: bcd, c: cd, d: d });
        stack.push({ a: a, b: ab, c: abc, d: abcd });
      }
    }

    out.length = i;
    return out;
  }
}
