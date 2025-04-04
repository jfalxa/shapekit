import { Vec2 } from "../geometry/vec2";

export function evenOddRule(point: Vec2, polygon: Vec2[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = polygon[i];
    const b = polygon[j];

    // Check if the point's y-coordinate is between the y-values of the edge endpoints
    const yBetween = a[1] > point[1] !== b[1] > point[1];

    if (yBetween) {
      // ratio for how far point[1] is on the segment ab
      const t = (point[1] - a[1]) / (b[1] - a[1]);

      // Compute the x-coordinate where the edge crosses the horizontal line at point.y
      const xIntersection = a[0] + t * (b[0] - a[0]);

      // Check if the point is to the left of this intersection
      const isLeftOfIntersection = point[0] < xIntersection;

      if (isLeftOfIntersection) {
        inside = !inside; // Toggle inside status
      }
    }
  }

  return inside;
}
