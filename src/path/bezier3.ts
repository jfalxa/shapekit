import { Vec2 } from "../math/vec2";
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
  sx: number | undefined;
  sy: number | undefined;
  ex: number;
  ey: number;

  constructor(
    x: number,
    y: number,
    sx: number,
    sy: number,
    ex?: number,
    ey?: number,
    public segments = 10
  ) {
    super(x, y);

    if (ex !== undefined && ey !== undefined) {
      this.sx = sx;
      this.sy = sy;
      this.ex = ex;
      this.ey = ey;
    } else {
      this.ex = sx;
      this.ey = sy;
    }
  }

  getOptionalControl(): Vec2 | undefined {
    if (this.sx === undefined || this.sy === undefined) return undefined;
    return new Vec2(this.sx, this.sy);
  }

  getSharedControl(): Vec2 {
    return new Vec2(this.ex, this.ey);
  }

  apply(path: Path2D, control?: Vec2) {
    const sx = this.sx ?? control?.x;
    const sy = this.sy ?? control?.y;
    if (sx === undefined || sy === undefined) {
      throw new Error("Missing start control point");
    }

    path.bezierCurveTo(sx, sy, this.ex, this.ey, this.x, this.y);
  }

  sample(from: Vec2, control?: Vec2): Vec2[] {
    const sx = this.sx ?? control?.x;
    const sy = this.sy ?? control?.y;

    if (sx === undefined || sy === undefined) {
      throw new Error("Missing start control point");
    }

    return Bezier3.sample(
      from.x,
      from.y,
      sx,
      sy,
      this.ex,
      this.ey,
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
    p3x: number,
    p3y: number,
    segments: number
  ) {
    if (p1x === undefined || p1y === undefined) {
      throw new Error("Missing start control point");
    }

    const points: Vec2[] = [];
    for (let t = 0; t <= 1; t += 1 / segments) {
      const x =
        (1 - t) ** 3 * p0x +
        3 * (1 - t) ** 2 * t * p1x +
        3 * (1 - t) * t ** 2 * p2x +
        t ** 3 * p3x;

      const y =
        (1 - t) ** 3 * p0y +
        3 * (1 - t) ** 2 * t * p1y +
        3 * (1 - t) * t ** 2 * p2y +
        t ** 3 * p3y;

      points.push(new Vec2(x, y));
    }
    return points;
  }
}
