import { Shape } from "../shapes/shape";
import { Point } from "../math/vec2";

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
