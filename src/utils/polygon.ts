import { Vec2, Point } from "../math/vec2";

// even odd rule algorithm
export function isPointInPolygon(polygon: Vec2[], point: Point): boolean {
  let inside = false;
  const len = polygon.length;

  for (let i = 0, j = len - 1; i < len; j = i++) {
    const a = polygon[i];
    const b = polygon[j];

    const yBetween = a.y > point.y !== b.y > point.y;

    if (yBetween) {
      const t = (point.y - a.y) / (b.y - a.y);
      const xIntersection = a.x + t * (b.x - a.x);
      const isLeftOfIntersection = point.x < xIntersection;

      if (isLeftOfIntersection) {
        inside = !inside;
      }
    }
  }

  return inside;
}

// separating axis theorem
export function doPolygonsOverlap(a: Vec2[], b: Vec2[]): boolean {
  const axis = new Vec2();

  for (const polygon of [a, b]) {
    const len = polygon.length;
    for (let i = 0; i < len; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % len];

      axis.put(p2.y - p1.y, -(p2.x - p1.x));

      const [minA, maxA] = projectPolygon(a, axis);
      const [minB, maxB] = projectPolygon(b, axis);

      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }

  return true;
}

function projectPolygon(points: Vec2[], axis: Vec2): [number, number] {
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const projection = p.x * axis.x + p.y * axis.y;
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }

  return [min, max];
}
