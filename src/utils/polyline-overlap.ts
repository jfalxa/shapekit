import { Shape } from "../geometry/shape";
import { Vec2 } from "../geometry/vec2";

export function polylinesOverlap(a: Shape, b: Shape): boolean {
  const radius1 = a.stroke ? (a.lineWidth ?? 1) / 2 : 0;
  const radius2 = b.stroke ? (b.lineWidth ?? 1) / 2 : 0;
  const threshold = (radius1 + radius2) * (radius1 + radius2);

  const aLen = a.hull.length;
  const bLen = b.hull.length;

  // add an offset to deal with polygons closing segment
  const aOffset = a.fill ? 0 : -1;
  const bOffset = b.fill ? 0 : -1;

  for (let i = 0; i < aLen + aOffset; i++) {
    const a1 = a.hull[i];
    const a2 = a.hull[(i + 1) % aLen] ?? a.hull[i];

    for (let j = 0; j < bLen + bOffset; j++) {
      const b1 = b.hull[j];
      const b2 = b.hull[(j + 1) % bLen];

      if (segmentsDistance(a1, a2, b1, b2) <= threshold) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns the minimum distance between two line segments a1b1 and a2b2.
 */
function segmentsDistance(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2) {
  if (doLinesIntersect(a1, a2, b1, b2)) return 0;

  const d1 = pointToSegmentDistance(a1, b1, b2);
  const d2 = pointToSegmentDistance(a2, b1, b2);
  const d3 = pointToSegmentDistance(b1, a1, a2);
  const d4 = pointToSegmentDistance(b2, a1, a2);

  return Math.min(d1, d2, d3, d4);
}

function doLinesIntersect(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  const d1 = crossProduct(a1, a2, b1);
  const d2 = crossProduct(a1, a2, b2);
  const d3 = crossProduct(b1, b2, a1);
  const d4 = crossProduct(b1, b2, a2);

  if (d1 * d2 < 0 && d3 * d4 < 0) return true;

  if (d1 === 0 && b1.between(a1, a2)) return true;
  if (d2 === 0 && b2.between(a1, a2)) return true;
  if (d3 === 0 && a1.between(b1, b2)) return true;
  if (d4 === 0 && a2.between(b1, b2)) return true;

  return false;
}

/**
 * Returns the distance from point p to the line segment ab.
 */
const projection = new Vec2(0, 0);
function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const l2 = squaredDistance(a, b);

  // a and b are the same point
  if (l2 === 0) return squaredDistance(p, a);

  // Consider the line extending the segment, parameterized as a + t (b - a).
  // We find the projection of point p onto the line.
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  projection.put(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
  return squaredDistance(p, projection);
}

/**
 * Returns the squared distance between two points.
 */
function squaredDistance(p1: Vec2, p2: Vec2): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

function crossProduct(p: Vec2, q: Vec2, r: Vec2): number {
  return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
}
