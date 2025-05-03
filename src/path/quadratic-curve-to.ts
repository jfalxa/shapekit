import { Point, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { pointToLineDistance } from "../utils/polyline";
import { ControlledSegment } from "./segment";

export function quadraticCurveTo(
  cpx: number,
  cpy: number,
  x?: number,
  y?: number
) {
  return new QuadraticCurveTo(cpx, cpy, x, y);
}

export class QuadraticCurveTo extends ControlledSegment {
  control: Vec2 | undefined;

  constructor(cpx: number, cpy: number, x?: number, y?: number) {
    super(x ?? cpx, y ?? cpy);

    if (x !== undefined && y !== undefined) {
      this.control = new Vec2(cpx, cpy);
    }
  }

  getOptionalControlPoint() {
    return this.control;
  }

  getSharedControlPoint() {
    return this._control;
  }

  apply(path: Path2D): void {
    path.quadraticCurveTo(
      this._control.x,
      this._control.y,
      this.to.x,
      this.to.y
    );
  }

  sample(quality = 1): Vec2[] {
    return QuadraticCurveTo.adaptiveSample(
      this.from,
      this._control,
      this.to,
      quality,
      this.points
    );
  }

  join(aabb: BoundingBox) {
    const from = this.from;
    const cp = this._control;
    const to = this.to;

    this.min.put(Infinity);
    this.max.put(-Infinity);

    this.min.min(from).min(to);
    this.max.max(from).max(to);

    const point = new Vec2(0, 0);

    const denomX = to.x - 2 * cp.x + from.x;
    if (denomX !== 0) {
      const t = (from.x - cp.x) / denomX;
      if (t > 0 && t < 1) {
        QuadraticCurveTo.sample(from, cp, to, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    const denomY = to.y - 2 * cp.y + from.y;
    if (denomY !== 0) {
      const t = (from.y - cp.y) / denomY;
      if (t > 0 && t < 1) {
        QuadraticCurveTo.sample(from, cp, to, t, point);
        this.min.min(point);
        this.max.max(point);
      }
    }

    aabb.merge(this);
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
  }

  static sample(
    from: Point,
    cp: Point,
    to: Point,
    t: number,
    out = new Vec2(0, 0)
  ) {
    out.x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cp.x + t * t * to.x;
    out.y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cp.y + t * t * to.y;
    return out;
  }

  static adaptiveSample(
    from: Point,
    cp: Point,
    to: Point,
    quality: number,
    out: Vec2[] = []
  ) {
    let i = 0;
    const tolerance = 1 / quality;
    const stack = [{ a: from, b: cp, c: to }];

    while (stack.length > 0) {
      const { a, b, c } = stack.pop()!;
      const midCurve = QuadraticCurveTo.sample(a, b, c, 0.5);
      const error = pointToLineDistance(midCurve, a, c);

      if (error <= tolerance) {
        if (!out[i]) out[i] = new Vec2(0, 0);
        out[i++].put(c.x, c.y);
      } else {
        // de Casteljau subdivision
        const ab = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const bc = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
        const abc = { x: (ab.x + bc.x) / 2, y: (ab.y + bc.y) / 2 };

        stack.push({ a: abc, b: bc, c: c });
        stack.push({ a: a, b: ab, c: abc });
      }
    }

    out.length = i;
    return out;
  }
}
