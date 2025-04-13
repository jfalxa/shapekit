import { Point, Vec2 } from "../math/vec2";
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

  apply(path: Path2D, control?: Vec2): void {
    const _control = this.control ?? control;
    if (!_control) throw new Error("Missing control point");
    path.quadraticCurveTo(_control.x, _control.y, this.to.x, this.to.y);
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

  scale(sx: number, sy: number): void {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
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
