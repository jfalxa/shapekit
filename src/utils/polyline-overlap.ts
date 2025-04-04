import { Shape } from "../geometry/shape";
import { Vec2 } from "../geometry/vec2";
import { pointToSegmentDistance } from "./point-in-polyline";

export function doPolylinesOverlap(a: Shape, b: Shape): boolean {
  const radius1 = a.stroke ? (a.lineWidth ?? 1) / 2 : 0;
  const radius2 = b.stroke ? (b.lineWidth ?? 1) / 2 : 0;
  const threshold = radius1 + radius2;

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

function crossProduct(p: Vec2, q: Vec2, r: Vec2): number {
  return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
}
