import { Vec2 } from "../math/vec2";
import { Arc } from "./arc";
import { Segment } from "./segment";

export function corner(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number,
  segments = 10
) {
  return new Corner(x, y, cx, cy, radius, segments);
}

export class Corner extends Segment {
  constructor(
    x: number,
    y: number,
    public cx: number,
    public cy: number,
    public radius: number,
    public segments = 10
  ) {
    super(x, y);
  }

  apply(path: Path2D) {
    path.arcTo(this.cx, this.cy, this.x, this.y, this.radius);
    path.lineTo(this.x, this.y);
  }

  sample(from: Vec2) {
    return Corner.sample(
      from.x,
      from.y,
      this.cx,
      this.cy,
      this.x,
      this.y,
      this.radius,
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
    r: number,
    segments: number
  ): Vec2[] {
    const v0 = new Vec2(p0x, p0y);
    const cp = new Vec2(p1x, p1y);
    const v2 = new Vec2(p2x, p2y);

    const t0 = new Vec2(0, 0);
    const t1 = new Vec2(0, 0);

    const bisector = new Vec2(0, 0);
    const center = new Vec2(0, 0);

    // Compute unit vectors for the rays from P1 to P0 and from P1 to P2.
    v0.subtract(cp).normalize();
    v2.subtract(cp).normalize();

    // Angle between the two rays.
    const theta = Math.acos(v0.dot(v2));

    // Distance from P1 to tangent points along the rays.
    const d = r / Math.tan(theta / 2);

    // Compute the tangent points T0 and T1.
    t0.copy(v0).scale(d).add(cp);
    t1.copy(v2).scale(d).add(cp);

    // Compute the angle bisector direction.
    bisector.copy(v0).add(v2).normalize();

    // Find the center of the circle along the bisector.
    const offset = r / Math.sin(theta / 2);
    center.copy(bisector).scale(offset).add(cp);

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
    points.push(new Vec2(p2x, p2y));

    return points;
  }
}
