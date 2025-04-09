import { Matrix3 } from "../math/mat3";
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
  start: Vec2 | undefined;
  end: Vec2;

  constructor(
    x: number,
    y: number,
    sx: number,
    sy: number,
    ex?: number,
    ey?: number,
    segments = 10
  ) {
    super(x, y, segments);

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

  apply(path: Path2D, control?: Vec2) {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    path.bezierCurveTo(
      start.x,
      start.y,
      this.end.x,
      this.end.y,
      this.to.x,
      this.to.y
    );
  }

  sample(from: Vec2, control?: Vec2): Vec2[] {
    const start = this.start ?? control;
    if (!start) throw new Error("Missing start control point");

    return Bezier3.sample(
      from,
      start,
      this.end,
      this.to,
      this.segments,
      this.points
    );
  }

  transform(matrix: Matrix3): void {
    this.to.transform(matrix);
    this.start?.transform(matrix);
    this.end.transform(matrix);
  }

  static sample(
    p0: Vec2,
    p1: Vec2,
    p2: Vec2,
    p3: Vec2,
    segments = 10,
    points = new Array<Vec2>(segments + 2)
  ) {
    let i = 0;
    for (let t = 0; t <= 1; t += 1 / segments) {
      const x =
        (1 - t) ** 3 * p0.x +
        3 * (1 - t) ** 2 * t * p1.x +
        3 * (1 - t) * t ** 2 * p2.x +
        t ** 3 * p3.x;

      const y =
        (1 - t) ** 3 * p0.y +
        3 * (1 - t) ** 2 * t * p1.y +
        3 * (1 - t) * t ** 2 * p2.y +
        t ** 3 * p3.y;

      if (!points[i]) points[i] = new Vec2(0, 0);
      points[i++].put(x, y);
    }
    return points;
  }
}
