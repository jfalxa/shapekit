import { v, Vec2 } from "../math/vec2";
import { Arc } from "./arc";
import { Segment } from "./segment";

export function corner(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius = 0,
  segments = 10
) {
  return new Corner(x, y, cx, cy, radius, segments);
}

export class Corner extends Segment {
  control: Vec2;

  constructor(
    x: number,
    y: number,
    cx: number,
    cy: number,
    public radius = 0,
    public segments = 10
  ) {
    super(x, y);
    this.control = new Vec2(cx, cy);
  }

  apply(path: Path2D) {
    path.arcTo(
      this.control.x,
      this.control.y,
      this.to.x,
      this.to.y,
      this.radius
    );
    path.lineTo(this.to.x, this.to.y);
  }

  sample(from: Vec2) {
    return Corner.sample(
      from,
      this.control,
      this.to,
      this.radius,
      this.segments
    );
  }

  static sample(
    p0: Vec2,
    p1: Vec2,
    p2: Vec2,
    r: number,
    segments: number
  ): Vec2[] {
    // Compute unit vectors for the rays from P1 to P0 and from P1 to P2.
    const v0 = v(p0).subtract(p1).normalize();
    const v2 = v(p2).subtract(p1).normalize();

    // Angle between the two rays.
    const theta = Math.acos(v0.dot(v2));

    // Distance from P1 to tangent points along the rays.
    const d = r / Math.tan(theta / 2);

    // Compute the tangent points T0 and T1.
    const t0 = v(v0).scale(d).add(p1);
    const t1 = v(v2).scale(d).add(p1);

    // Compute the angle bisector direction.
    const bisector = v(v0).add(v2).normalize();

    // Find the center of the circle along the bisector.
    const offset = r / Math.sin(theta / 2);
    const center = v(bisector).scale(offset).add(p1);

    // Calculate the start and end angles for the arc.
    const startAngle = Math.atan2(t0.y - center.y, t0.x - center.x);
    const endAngle = Math.atan2(t1.y - center.y, t1.x - center.x);

    const points = Arc.sampleArc(
      center.x,
      center.y,
      startAngle,
      endAngle,
      r,
      segments
    );

    // put the target point
    points.push(v2.clone());

    return points;
  }
}
