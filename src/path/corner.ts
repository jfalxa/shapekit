import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
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
    segments = 10
  ) {
    super(x, y, segments);
    this.control = new Vec2(cx, cy);
    this.points.push(new Vec2(0, 0));
  }

  apply(path: Path2D, _control: Vec2 | undefined, sx: number, sy: number) {
    const control = v(this.control).scale(sx, sy);
    const to = v(this.to).scale(sx, sy);

    path.arcTo(control.x, control.y, to.x, to.y, this.radius);
    path.lineTo(to.x, to.y);
  }

  sample(from: Vec2, _control: Vec2 | undefined, sx: number, sy: number) {
    const p0 = v(from).scale(sx, sy);
    const p1 = v(this.control).scale(sx, sy);
    const p2 = v(this.to).scale(sx, sy);

    const r = this.radius;
    const segments = 10;

    this.points.length = segments + 2;

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

    for (let i = 0; i <= segments; i++) {
      if (!this.points[i]) this.points[i] = new Vec2(0, 0);
      Arc.sample(center, r, startAngle, endAngle, i / this.segments, this.points[i]); // prettier-ignore
    }

    // save the target point at the last position
    this.points[segments + 1].copy(p2);

    return this.points;
  }

  join(aabb: BoundingBox, from: Vec2, _control: Vec2 | undefined) {
    this.min.copy(from).min(this.to).min(this.control);
    this.max.copy(from).max(this.to).max(this.control);

    aabb.merge(this);
  }
}
