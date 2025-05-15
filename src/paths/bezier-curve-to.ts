import { solveQuadratic } from "../math/num";
import { Point, Vec2 } from "../math/vec2";
import { pointToLineDistance2 } from "../utils/polyline";
import { ControlledSegment } from "./segment";

export function bezierCurveTo(
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  x?: number,
  y?: number
) {
  return new BezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
}

export class BezierCurveTo extends ControlledSegment {
  cp1x?: number;
  cp1y?: number;
  cp2x: number;
  cp2y: number;

  _start: Vec2 | undefined;
  _end: Vec2;

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
      this.cp1x = cp1x;
      this.cp1y = cp1y;
      this.cp2x = cp2x;
      this.cp2y = cp2y;
      this._start = new Vec2(cp1x, cp1y);
      this._end = new Vec2(cp2x, cp2y);
    } else {
      this.cp2x = cp1x;
      this.cp2y = cp1y;
      this._end = new Vec2(cp1x, cp1y);
    }
  }

  getOptionalControlPoint() {
    return this._start;
  }

  getSharedControlPoint() {
    return this._end;
  }

  scale(sx: number, sy: number) {
    super.scale(sx, sy);
    this._end.put(this.cp2x, this.cp2y).scale(sx, sy);
    if (this.cp1x === undefined || this.cp1y === undefined) {
      this._start = undefined;
    } else {
      if (this._start === undefined) this._start = new Vec2();
      this._start.put(this.cp1x, this.cp1y).scale(sx, sy);
    }
  }

  apply(path: Path2D) {
    path.bezierCurveTo(
      this._currentControl.x,
      this._currentControl.y,
      this._end.x,
      this._end.y,
      this._to.x,
      this._to.y
    );
  }

  sample(quality: number): Vec2[] {
    return BezierCurveTo.adaptiveSample(
      this._from,
      this._currentControl,
      this._end,
      this._to,
      quality
    );
  }

  aabb() {
    const p0 = this._from;
    const p1 = this._currentControl;
    const p2 = this._end;
    const p3 = this._to;

    const ts = [];

    this.min.copy(p0).min(p3);
    this.max.copy(p0).max(p3);

    const ax = -p0.x + 3 * p1.x - 3 * p2.x + p3.x;
    const bx = 2 * (p0.x - 2 * p1.x + p2.x);
    const cx = -p0.x + p1.x;
    ts.push(...solveQuadratic(ax, bx, cx));

    const ay = -p0.y + 3 * p1.y - 3 * p2.y + p3.y;
    const by = 2 * (p0.y - 2 * p1.y + p2.y);
    const cy = -p0.y + p1.y;
    ts.push(...solveQuadratic(ay, by, cy));

    const extremum = new Vec2();

    for (let i = 0; i < ts.length; i++) {
      if (ts[i] > 0 && ts[i] < 1) {
        BezierCurveTo.sample(p0, p1, p2, p3, ts[i], extremum);
        this.min.min(extremum);
        this.max.max(extremum);
      }
    }

    return this;
  }

  static sample(
    from: Point,
    cp1: Point,
    cp2: Point,
    to: Point,
    t: number,
    out = new Vec2()
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

    const tolerance2 = (1 / quality) * (1 / quality);
    const stack = [{ a: from, b: cp1, c: cp2, d: to }];
    const midCurve = new Vec2();

    while (stack.length > 0) {
      const { a, b, c, d } = stack.pop()!;

      BezierCurveTo.sample(a, b, c, d, 0.5, midCurve);
      const distance2 = pointToLineDistance2(midCurve, a, d);

      if (distance2 <= tolerance2) {
        if (!out[i]) out[i] = new Vec2();
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
