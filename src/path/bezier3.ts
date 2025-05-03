import { Point, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { solveQuadratic } from "../math/solver";
import { Segment } from "./segment";
import { pointToLineDistance } from "../utils/polyline";

export function bezier3(
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  x?: number,
  y?: number
) {
  return new Bezier3(cp1x, cp1y, cp2x, cp2y, x, y);
}

export class Bezier3 extends Segment {
  start: Vec2 | undefined;
  end: Vec2;

  constructor(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x?: number,
    y?: number
  ) {
    super(x ?? cp2x, y ?? cp2y);

    if (x !== undefined && y !== undefined) {
      this.start = new Vec2(cp1x, cp1y);
      this.end = new Vec2(cp2x, cp2y);
    } else {
      this.end = new Vec2(cp1x, cp1y);
    }
  }

  getOptionalControl() {
    return this.start;
  }

  getSharedControl() {
    return this.end;
  }

  apply(path: Path2D, control: Vec2 | undefined) {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    const cp1 = start;
    const cp2 = this.end;
    const to = this.to;

    path.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y);
  }

  sample(from: Vec2, control: Vec2 | undefined, quality: number): Vec2[] {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    const cp1 = start;
    const cp2 = this.end;
    const to = this.to;

    return Bezier3.adaptiveSample(from, cp1, cp2, to, quality);
  }

  join(aabb: BoundingBox, from: Vec2, control: Vec2 | undefined): void {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    const cp1 = start;
    const cp2 = this.end;
    const to = this.to;

    this.min.put(Infinity);
    this.max.put(-Infinity);

    this.min.min(from).min(to);
    this.max.max(from).max(to);

    const point = new Vec2(0, 0);

    const ax = -from.x + 3 * cp1.x - 3 * cp2.x + to.x;
    const bx = 2 * (from.x - 2 * cp1.x + cp2.x);
    const cx = -from.x + cp1.x;

    for (const t of solveQuadratic(ax, bx, cx)) {
      if (t > 0 && t < 1) {
        Bezier3.sample(from, cp1, cp2, to, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    const ay = -from.y + 3 * cp1.y - 3 * cp2.y + to.y;
    const by = 2 * (from.y - 2 * cp1.y + cp2.y);
    const cy = -from.y + cp1.y;

    for (const t of solveQuadratic(ay, by, cy)) {
      if (t > 0 && t < 1) {
        Bezier3.sample(from, cp1, cp2, to, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    aabb.merge(this);
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.start?.scale(sx, sy);
    this.end.scale(sx, sy);
  }

  static sample(
    from: Point,
    cp1: Point,
    cp2: Point,
    to: Point,
    t: number,
    out = new Vec2(0, 0)
  ) {
    out.x =
      (1 - t) ** 3 * from.x +
      3 * (1 - t) ** 2 * t * cp1.x +
      3 * (1 - t) * t ** 2 * cp2.x +
      t ** 3 * to.x;

    out.y =
      (1 - t) ** 3 * from.y +
      3 * (1 - t) ** 2 * t * cp1.y +
      3 * (1 - t) * t ** 2 * cp2.y +
      t ** 3 * to.y;

    return out;
  }

  static adaptiveSample(
    from: Point,
    cp1: Point,
    cp2: Point,
    to: Point,
    quality: number,
    out: Vec2[] = []
  ) {
    let i = 0;
    const tolerance = 1 / quality;
    const stack = [{ a: from, b: cp1, c: cp2, d: to }];

    while (stack.length > 0) {
      const { a, b, c, d } = stack.pop()!;

      const midCurve = Bezier3.sample(a, b, c, d, 0.5);
      const distance = pointToLineDistance(midCurve, a, d);

      if (distance <= tolerance) {
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
