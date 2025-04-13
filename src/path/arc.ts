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

  scale(sx: number, sy: number): void {
    this.to.scale(sx, sy);
    this.radius *= Math.min(sx, sy);
  }

  apply(path: Path2D) {
    path.arc(
      this.to.x,
      this.to.y,
      this.radius,
      this.startAngle,
      this.endAngle,
      this.counterclockwise
    );
  }

  join(aabb: BoundingBox, from: Vec2, _control: Vec2 | undefined) {
    this.min.copy(this.to).translate(-this.radius).min(from);
    this.max.copy(this.to).translate(this.radius).max(from);
    aabb.merge(this);
  }

  sample(): Vec2[] {
    this.points.length = this.segments + 1;

    for (let i = 0; i <= this.segments; i++) {
      if (!this.points[i]) this.points[i] = new Vec2(0, 0);
      Arc.sample(this.to, this.radius, this.startAngle, this.endAngle, i / this.segments, this.points[i]); // prettier-ignore
    }

    return this.points;
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
