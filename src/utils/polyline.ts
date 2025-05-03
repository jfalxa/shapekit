import { Shape } from "../shapes/shape";
import { Point, Vec2 } from "../math/vec2";

export function isPointInPolyline(point: Point, polyline: Shape): boolean {
  const radius = polyline.stroke ? (polyline.lineWidth ?? 1) / 2 : 0;
  const threshold = radius;

  const len = polyline.points.length;

  for (let i = 0; i < len - 1; i++) {
    const p1 = polyline.points[i];
    const p2 = polyline.points[(i + 1) % len] ?? polyline.points[i];

    if (pointToLineDistance(point, p1, p2) <= threshold) {
      return true;
    }
  }

  return false;
}

export function doPolylinesOverlap(a: Shape, b: Shape): boolean {
  const radiusA = a.stroke ? (a.lineWidth ?? 1) / 2 : 0;
  const radiusB = b.stroke ? (b.lineWidth ?? 1) / 2 : 0;
  const threshold = radiusA + radiusB;

  const aLen = a.points.length;
  const bLen = b.points.length;

  for (let i = 0; i < aLen; i++) {
    const a1 = a.points[i];
    const a2 = a.points[(i + 1) % aLen];

    for (let j = 0; j < bLen; j++) {
      const b1 = b.points[j];
      const b2 = b.points[(j + 1) % bLen];

      if (segmentsDistance(a1, a2, b1, b2) <= threshold) {
        return true;
      }
    }
  }

  return false;
}

export function pointToLineDistance(p: Point, a: Point, b: Point): number {
  const l2 = squaredDistance(a, b);
  if (l2 === 0) return Math.sqrt(squaredDistance(p, a));

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };

  return Math.sqrt(squaredDistance(p, projection));
}

function segmentsDistance(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2) {
  if (doLinesIntersect(a1, a2, b1, b2)) return 0;

  const d1 = pointToLineDistance(a1, b1, b2);
  const d2 = pointToLineDistance(a2, b1, b2);
  const d3 = pointToLineDistance(b1, a1, a2);
  const d4 = pointToLineDistance(b2, a1, a2);

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

function squaredDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

function crossProduct(p: Vec2, q: Vec2, r: Vec2): number {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}
