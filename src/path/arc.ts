import { Point, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export function arc(
  x: number,
  y: number,
  startAngle: number,
  endAngle: number,
  radius: number,
  counterclockwise?: boolean,
  segments = 10
) {
  return new Arc(
    x,
    y,
    startAngle,
    endAngle,
    radius,
    counterclockwise,
    segments
  );
}

export class Arc extends Segment {
  static #P = new Vec2(0, 0);

  constructor(
    x: number,
    y: number,
    public startAngle: number,
    public endAngle: number,
    public radius: number,
    public counterclockwise?: boolean,
    segments = 10
  ) {
    super(x, y, segments);
  }

  apply(path: Path2D, _control: Vec2, sx: number, sy: number) {
    const to = Arc.#P.copy(this.to).scale(sx, sy);
    const radius = this.radius * Math.min(sx, sy);

    path.arc(
      to.x,
      to.y,
      radius,
      this.startAngle,
      this.endAngle,
      this.counterclockwise
    );
  }

  sample(_from: any, _control: any, sx: number, sy: number): Vec2[] {
    const to = Arc.#P.copy(this.to).scale(sx, sy);
    const radius = this.radius * Math.min(sx, sy);

    this.points.length = this.tolerance + 1;

    for (let i = 0; i <= this.tolerance; i++) {
      this.points[i] = Arc.sample(
        to,
        radius,
        this.startAngle,
        this.endAngle,
        i / this.tolerance,
        this.points[i]
      );
    }

    return this.points;
  }

  join(aabb: BoundingBox, _from: Vec2, _control: Vec2 | undefined) {
    this.min.copy(this.to).translate(-this.radius);
    this.max.copy(this.to).translate(this.radius);
    aabb.merge(this);
  }

  static sample(
    center: Point,
    radius: number,
    startAngle: number,
    endAngle: number,
    t: number,
    out = new Vec2(0, 0)
  ) {
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;
    const angle = startAngle + angleDiff * t;
    out.x = center.x + radius * Math.cos(angle);
    out.y = center.y + radius * Math.sin(angle);
    return out;
  }
}
