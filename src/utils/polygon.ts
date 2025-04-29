import { Shape } from "../shapes/shape";
import { Vec2, Point } from "../math/vec2";

// even odd rule algorithm
export function isPointInPolygon(point: Point, shape: Shape): boolean {
  let inside = false;
  const n = shape.hull.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = shape.hull[i];
    const b = shape.hull[j];

    // Check if the point's y-coordinate is between the y-values of the edge endpoints
    const yBetween = a[1] > point.y !== b[1] > point.y;

    if (yBetween) {
      // ratio for how far point.y is on the segment ab
      const t = (point.y - a[1]) / (b[1] - a[1]);

      // Compute the x-coordinate where the edge crosses the horizontal line at point.y
      const xIntersection = a[0] + t * (b[0] - a[0]);

      // Check if the point is to the left of this intersection
      const isLeftOfIntersection = point.x < xIntersection;

      if (isLeftOfIntersection) {
        inside = !inside; // Toggle inside status
      }
    }
  }

  return inside;
}

// separating axis theorem
export function doPolygonsOverlap(a: Shape, b: Shape): boolean {
  const axis = new Vec2(0, 0);

  for (const polygon of [a.hull, b.hull]) {
    const len = polygon.length;

    for (let i = 0; i < len; i++) {
      // Current edge from p1 to p2 (wrapping around)
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % len];

      // Compute the perpendicular axis (normal of the edge).
      axis.put(p2[1] - p1[1], -(p2[0] - p1[0]));

      // Project both polygons onto the axis.
      const [minA, maxA] = projectPolygon(a.hull, axis);
      const [minB, maxB] = projectPolygon(b.hull, axis);

      // If there is a gap between the projections, polygons do not overlap.
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
    const projection = p[0] * axis[0] + p[1] * axis[1];
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }

  return [min, max];
}
