import { Point } from "../geometry/vec2";

const axis: Point = { x: 0, y: 0 };
export function SAT(poly1: Point[], poly2: Point[]): boolean {
  // Check both polygons' edges.
  for (const polygon of [poly1, poly2]) {
    const len = polygon.length;

    for (let i = 0; i < len; i++) {
      // Current edge from p1 to p2 (wrapping around)
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % len];

      // Compute the perpendicular axis (normal of the edge).
      axis.x = p2.y - p1.y;
      axis.y = -(p2.x - p1.x);

      // Project both polygons onto the axis.
      const [minA, maxA] = projectPolygon(poly1, axis);
      const [minB, maxB] = projectPolygon(poly2, axis);

      // If there is a gap between the projections, polygons do not overlap.
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }

  return true;
}

const buffer: [number, number] = [0, 0];
function projectPolygon(points: Point[], axis: Point): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const projection = p.x * axis.x + p.y * axis.y;
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }
  buffer[0] = min;
  buffer[1] = max;
  return buffer;
}
