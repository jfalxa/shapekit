import { Point, Vec2 } from "../math/vec2";
import { pointToLineDistance2 } from "../utils/polyline";
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

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
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

  aabb() {
    const p0 = this.from;
    const p1 = this._control;
    const p2 = this.to;

    const extremum = new Vec2();

    this.min.copy(p0).min(p2);
    this.max.copy(p0).max(p2);

    const denomX = p0.x - 2 * p1.x + p2.x;
    if (denomX !== 0) {
      const tx = (p0.x - p1.x) / denomX;
      if (tx > 0 && tx < 1) {
        QuadraticCurveTo.sample(p0, p1, p2, tx, extremum);
        this.min.min(extremum);
        this.max.max(extremum);
      }
    }

    const denomY = p0.y - 2 * p1.y + p2.y;
    if (denomY !== 0) {
      const ty = (p0.y - p1.y) / denomY;
      if (ty > 0 && ty < 1) {
        QuadraticCurveTo.sample(p0, p1, p2, ty, extremum);
        this.min.min(extremum);
        this.max.max(extremum);
      }
    }

    return this;
  }

  static sample(
    from: Point,
    cp: Point,
    to: Point,
    t: number,
    out = new Vec2()
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

    const tolerance2 = (1 / quality) * (1 / quality);
    const stack = [{ a: from, b: cp, c: to }];
    const midCurve = new Vec2();

    while (stack.length > 0) {
      const { a, b, c } = stack.pop()!;

      QuadraticCurveTo.sample(a, b, c, 0.5, midCurve);
      const distance2 = pointToLineDistance2(midCurve, a, c);

      if (distance2 <= tolerance2) {
        if (!out[i]) out[i] = new Vec2();
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
