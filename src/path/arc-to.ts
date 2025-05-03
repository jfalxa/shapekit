import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Arc } from "./arc";
import { Segment } from "./segment";

export function arcTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 0
) {
  return new ArcTo(x1, y1, x2, y2, radius);
}

export class ArcTo extends Segment {
  control: Vec2;

  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    public radius = 0
  ) {
    super(x2, y2);
    this.control = new Vec2(x1, y1);
    this.points.push(new Vec2(0, 0));
  }

  apply(path: Path2D) {
    path.arcTo(
      this.control.x,
      this.control.y,
      this.to.x,
      this.to.y,
      this.radius
    );
  }

  sample(quality: number) {
    const { center, startAngle, endAngle } = ArcTo.toArc(
      this.from,
      this.control,
      this.to,
      this.radius
    );

    return Arc.adaptiveSample(
      center,
      this.radius,
      this.radius,
      startAngle,
      endAngle,
      quality,
      this.points
    );
  }

  join(aabb: BoundingBox) {
    const arc = ArcTo.toArc(this.from, this.control, this.to, this.radius);

    const extrema = Arc.sampleExtrema(
      arc.center,
      arc.radius,
      arc.radius,
      arc.startAngle,
      arc.endAngle
    );

    BoundingBox.fit(extrema, this);

    aabb.merge(this);
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
  }

  static toArc(from: Vec2, cp: Vec2, to: Vec2, r: number) {
    // Compute unit vectors for the rays from P1 to P0 and from P1 to P2.
    const v0 = v(from).subtract(cp).normalize();
    const v2 = v(to).subtract(cp).normalize();

    // Angle between the two rays.
    const theta = Math.acos(v0.dot(v2));

    // Distance from P1 to tangent points along the rays.
    const d = r / Math.tan(theta / 2);

    // Compute the tangent points T0 and T1.
    const t0 = v(v0).scale(d).add(cp);
    const t1 = v(v2).scale(d).add(cp);

    // Compute the angle bisector direction.
    const bisector = v(v0).add(v2).normalize();

    // Find the center of the circle along the bisector.
    const offset = r / Math.sin(theta / 2);
    const center = v(bisector).scale(offset).add(cp);

    // Calculate the start and end angles for the arc.
    const startAngle = Math.atan2(t0.y - center.y, t0.x - center.x);
    const endAngle = Math.atan2(t1.y - center.y, t1.x - center.x);

    return { center, startAngle, endAngle, radius: r };
  }
}
