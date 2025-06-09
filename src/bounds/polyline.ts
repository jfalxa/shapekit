import { Point, Vec2 } from "../utils/vec2";

export function isPointInPolyline(
  polyline: Vec2[],
  lineWidth: number,
  point: Point
): boolean {
  const radius = lineWidth / 2;
  const threshold2 = radius * radius;

  const len = polyline.length;

  for (let i = 0; i < len - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[(i + 1) % len] ?? polyline[i];

    if (pointToLineDistance2(point, p1, p2) <= threshold2) {
      return true;
    }
  }

  return false;
}

export function doPolylinesOverlap(
  a: Vec2[],
  aLineWidth = 0,
  b: Vec2[],
  bLineWidth = 0
): boolean {
  const radiusA = aLineWidth / 2;
  const radiusB = bLineWidth / 2;
  const threshold = (radiusA + radiusB) * (radiusA + radiusB);

  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i < aLen; i++) {
    const a1 = a[i];
    const a2 = a[(i + 1) % aLen];

    for (let j = 0; j < bLen; j++) {
      const b1 = b[j];
      const b2 = b[(j + 1) % bLen];

      if (segmentsDistance2(a1, a2, b1, b2) <= threshold) {
        return true;
      }
    }
  }

  return false;
}

export function pointToLineDistance2(p: Point, a: Point, b: Point): number {
  const l2 = distance2(a, b);
  if (l2 === 0) return distance2(p, a);

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };

  return distance2(p, projection);
}

export function doLinesIntersect(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2
): boolean {
  const d1 = crossProduct(a1, a2, b1);
  const d2 = crossProduct(a1, a2, b2);
  const d3 = crossProduct(b1, b2, a1);
  const d4 = crossProduct(b1, b2, a2);

  if (d1 * d2 < 0 && d3 * d4 < 0) return true;

  if (d1 === 0 && between(b1, a1, a2)) return true;
  if (d2 === 0 && between(b2, a1, a2)) return true;
  if (d3 === 0 && between(a1, b1, b2)) return true;
  if (d4 === 0 && between(a2, b1, b2)) return true;

  return false;
}

function segmentsDistance2(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2) {
  if (doLinesIntersect(a1, a2, b1, b2)) return 0;

  const d1 = pointToLineDistance2(a1, b1, b2);
  const d2 = pointToLineDistance2(a2, b1, b2);
  const d3 = pointToLineDistance2(b1, a1, a2);
  const d4 = pointToLineDistance2(b2, a1, a2);

  return Math.min(d1, d2, d3, d4);
}

function distance2(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

function crossProduct(p: Vec2, q: Vec2, r: Vec2): number {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

function between(p: Vec2, a: Vec2, b: Vec2) {
  return (
    Math.min(a[0], b[0]) <= p[0] &&
    p[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= p[1] &&
    p[1] <= Math.max(a[1], b[1])
  );
}
