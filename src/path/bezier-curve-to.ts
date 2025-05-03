import { Point, Vec2 } from "../math/vec2";
import { pointToLineDistance } from "../utils/polyline";
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

  getOptionalControlPoint() {
    return this.start;
  }

  getSharedControlPoint() {
    return this.end;
  }

  apply(path: Path2D) {
    path.bezierCurveTo(
      this._control.x,
      this._control.y,
      this.end.x,
      this.end.y,
      this.to.x,
      this.to.y
    );
  }

  sample(quality: number): Vec2[] {
    return BezierCurveTo.adaptiveSample(
      this.from,
      this._control,
      this.end,
      this.to,
      quality
    );
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

      const midCurve = BezierCurveTo.sample(a, b, c, d, 0.5);
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
