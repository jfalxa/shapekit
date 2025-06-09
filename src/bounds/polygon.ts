import { Vec2, Point } from "../utils/vec2";
import { doLinesIntersect } from "./polyline";

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

export function doPolygonsOverlap(a: Vec2[], b: Vec2[]): boolean {
  for (let i = 0; i < a.length; i++) {
    const a1 = a[i];
    const a2 = a[(i + 1) % a.length];

    for (let j = 0; j < b.length; j++) {
      const b1 = b[j];
      const b2 = b[(j + 1) % b.length];

      if (doLinesIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}
