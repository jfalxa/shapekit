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
  constructor(
    x: number,
    y: number,
    public cx?: number,
    public cy?: number,
    public segments = 10
  ) {
    super(x, y);
  }

  getOptionalControl(): Vec2 | undefined {
    if (this.cx === undefined || this.cy === undefined) return undefined;
    return new Vec2(this.cx, this.cy);
  }

  getSharedControl(): Vec2 {
    return new Vec2(this.cx!, this.cy!);
  }

  apply(path: Path2D, control?: Vec2): void {
    const cx = this.cx ?? control?.x;
    const cy = this.cy ?? control?.y;
    if (cx === undefined || cy === undefined) {
      throw new Error("Missing control point");
    }

    path.quadraticCurveTo(cx, cy, this.x, this.y);
  }

  sample(from: Vec2, control?: Vec2): Vec2[] {
    const cx = this.cx ?? control?.x;
    const cy = this.cy ?? control?.y;
    if (cx === undefined || cy === undefined) {
      throw new Error("Missing control point");
    }

    return Bezier2.sample(
      from.x,
      from.y,
      cx,
      cy,
      this.x,
      this.y,
      this.segments
    );
  }

  static sample(
    p0x: number,
    p0y: number,
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    segments: number
  ): Vec2[] {
    if (p1x === undefined || p1y === undefined) {
      throw new Error("Missing control point");
    }

    const points: Vec2[] = [];
    for (let t = 0; t <= 1; t += 1 / segments) {
      const x = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
      const y = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;
      points.push(new Vec2(x, y));
    }
    return points;
  }
}
