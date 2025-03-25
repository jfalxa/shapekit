import { Point } from "../geometry/vec2";

export function evenOddRule(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = polygon[i];
    const b = polygon[j];

    // Check if the point's y-coordinate is between the y-values of the edge endpoints
    const yBetween = a.y > point.y !== b.y > point.y;

    if (yBetween) {
      // ratio for how far point.y is on the segment ab
      const t = (point.y - a.y) / (b.y - a.y);

      // Compute the x-coordinate where the edge crosses the horizontal line at point.y
      const xIntersection = a.x + t * (b.x - a.x);

      // Check if the point is to the left of this intersection
      const isLeftOfIntersection = point.x < xIntersection;

      if (isLeftOfIntersection) {
        inside = !inside; // Toggle inside status
      }
    }
  }

  return inside;
}
