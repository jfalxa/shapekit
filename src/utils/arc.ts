import { Vec2 } from "../math/vec2";

export function sampleArc(
  center: Vec2,
  startAngle: number,
  endAngle: number,
  radius: number,
  segments: number
): Vec2[] {
  const points: Vec2[] = [];
  let angleDiff = endAngle - startAngle;
  if (angleDiff < 0) angleDiff += 2 * Math.PI;

  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (angleDiff * i) / segments;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    points.push(new Vec2(x, y));
  }
  return points;
}

const v0 = new Vec2(0, 0);
const v1 = new Vec2(0, 0);
const t0 = new Vec2(0, 0);
const t1 = new Vec2(0, 0);
const bisector = new Vec2(0, 0);
const center = new Vec2(0, 0);

export function sampleArcTo(
  p0: Vec2,
  p1: Vec2,
  cp: Vec2,
  r: number,
  segments = 10
): Vec2[] {
  // Compute unit vectors for the rays from P1 to P0 and from P1 to P2.
  v0.copy(p0).subtract(cp).normalize();
  v1.copy(p1).subtract(cp).normalize();

  // Angle between the two rays.
  const theta = Math.acos(v0.dot(v1));

  // Distance from P1 to tangent points along the rays.
  const d = r / Math.tan(theta / 2);

  // Compute the tangent points T0 and T1.
  t0.copy(v0).scale(d).add(cp);
  t1.copy(v1).scale(d).add(cp);

  // Compute the angle bisector direction.
  bisector.copy(v0).add(v1).normalize();

  // Find the center of the circle along the bisector.
  const offset = r / Math.sin(theta / 2);
  center.copy(bisector).scale(offset).add(cp);

  // Calculate the start and end angles for the arc.
  const startAngle = Math.atan2(t0.y - center.y, t0.x - center.x);
  const endAngle = Math.atan2(t1.y - center.y, t1.x - center.x);

  const points = sampleArc(center, startAngle, endAngle, r, segments);

  // put the target point
  points.push(p1.clone());

  return points;
}
