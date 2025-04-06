import { Shape } from "../shapes/shape";
import { Vec2 } from "../math/vec2";

export function isPointInPolyline(point: Vec2, polyline: Shape): boolean {
  const radius = polyline.stroke ? (polyline.lineWidth ?? 1) / 2 : 0;
  const threshold = radius;

  const len = polyline.hull.length;

  for (let i = 0; i < len - 1; i++) {
    const p1 = polyline.hull[i];
    const p2 = polyline.hull[(i + 1) % len] ?? polyline.hull[i];

    if (pointToSegmentDistance(point, p1, p2) <= threshold) {
      return true;
    }
  }

  return false;
}

export function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const l2 = squaredDistance(a, b);

  // a and b are the same point
  if (l2 === 0) return Math.sqrt(squaredDistance(p, a));

  // Consider the line extending the segment, parameterized as a + t (b - a).
  // We find the projection of point p onto the line.
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = new Vec2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
  return Math.sqrt(squaredDistance(p, projection));
}

function squaredDistance(p1: Vec2, p2: Vec2): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}
