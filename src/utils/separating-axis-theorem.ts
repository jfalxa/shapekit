import { Shape } from "../geometry/shape";
import { Vec2 } from "../geometry/vec2";

const axis = new Vec2(0, 0);

export function SAT(a: Shape, b: Shape): boolean {
  for (const polygon of [a.hull, b.hull]) {
    const len = polygon.length;

    for (let i = 0; i < len; i++) {
      // Current edge from p1 to p2 (wrapping around)
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % len];

      // Compute the perpendicular axis (normal of the edge).
      axis[0] = p2[1] - p1[1];
      axis[1] = -(p2[0] - p1[0]);

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

const couple: [number, number] = [0, 0];

function projectPolygon(points: Vec2[], axis: Vec2): [number, number] {
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const projection = p[0] * axis[0] + p[1] * axis[1];
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }

  couple[0] = min;
  couple[1] = max;
  return couple;
}
