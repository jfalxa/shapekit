import { Vec2, Point } from "../math/vec2";
import { Shape } from "../renderables/shape";

// even odd rule algorithm
export function isPointInPolygon(point: Point, shape: Shape): boolean {
  let inside = false;
  const n = shape.points.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = shape.points[i];
    const b = shape.points[j];

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
export function doPolygonsOverlap(a: Shape, b: Shape): boolean {
  const axis = new Vec2(0, 0);
  const polygons = [a.points, b.points];

  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    const len = polygon.length;

    for (let j = 0; j < len; j++) {
      const p1 = polygon[j];
      const p2 = polygon[(j + 1) % len];

      axis.put(p2.y - p1.y, -(p2.x - p1.x));

      const [minA, maxA] = projectPolygon(a.points, axis);
      const [minB, maxB] = projectPolygon(b.points, axis);

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
