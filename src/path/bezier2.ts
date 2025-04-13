import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
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
    return Bezier2.sample(from, _control, this.to, this.segments, this.points);
  }

  scale(sx: number, sy: number): void {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
  }

  static sample(
    p0: Vec2,
    p1: Vec2,
    p2: Vec2,
    segments = 10,
    points = new Array<Vec2>(segments + 2)
  ): Vec2[] {
    let i = 0;
    for (let t = 0; t <= 1; t += 1 / segments) {
      const x =
        (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y =
        (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      if (!points[i]) points[i] = new Vec2(0, 0);
      points[i++].put(x, y);
    }
    return points;
  }
}
