import { Point, v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { pointToLineDistance } from "../utils/polyline";
import { Segment } from "./segment";

export function arc(
  x: number,
  y: number,
  radius: number,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  counterclockwise?: boolean
) {
  return new Arc(x, y, radius, startAngle, endAngle, counterclockwise);
}

export class Arc extends Segment {
  constructor(
    x: number,
    y: number,
    public radius: number,
    public startAngle = 0,
    public endAngle = 2 * Math.PI,
    public counterclockwise?: boolean
  ) {
    super(x, y);
  }

  apply(path: Path2D, _control: Vec2, sx: number, sy: number) {
    const to = v(this.to).scale(sx, sy);
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

  sample(
    _from: any,
    _control: any,
    sx: number,
    sy: number,
    quality: number
  ): Vec2[] {
    const to = v(this.to).scale(sx, sy);
    const radius = this.radius * Math.min(sx, sy);

    return Arc.adaptiveSample(
      to,
      radius,
      this.startAngle,
      this.endAngle,
      quality,
      this.points
    );
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

  static adaptiveSample(
    center: Point,
    radius: number,
    startAngle: number,
    endAngle: number,
    quality: number,
    out: Vec2[] = []
  ) {
    out[0] = new Vec2(
      center.x + radius * Math.cos(startAngle),
      center.y + radius * Math.sin(startAngle)
    );

    let i = 1;
    const tolerance = 1 / quality;
    const stack = [{ a: startAngle, b: endAngle }];

    while (stack.length > 0) {
      const { a, b } = stack.pop()!;

      const p0 = Arc.sample(center, radius, a, b, 0);
      const p1 = Arc.sample(center, radius, a, b, 1);
      const pm = Arc.sample(center, radius, a, b, 0.5);

      const err = pointToLineDistance(pm, p0, p1);

      if (err <= tolerance) {
        if (!out[i]) out[i] = new Vec2(0, 0);
        out[i++].put(p1.x, p1.y);
      } else {
        let diff = b - a;
        if (diff < 0) diff += Math.PI * 2;
        const midAngle = a + diff * 0.5;

        stack.push({ a: midAngle, b: b });
        stack.push({ a: a, b: midAngle });
      }
    }

    out.length = i;
    return out;
  }
}
