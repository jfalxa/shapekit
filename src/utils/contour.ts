import { v, Vec2 } from "../geometry/vec2";

export function getContour(polyline: Vec2[], thickness: number): Vec2[] {
  if (polyline.length < 2) {
    throw new Error("Polyline must have at least two points.");
  }

  const halfThickness = thickness / 2;
  const leftOffsets: Vec2[] = [];
  const rightOffsets: Vec2[] = [];

  // Precompute offsets for each point along the polyline.
  for (let i = 0; i < polyline.length; i++) {
    let offset: Vec2;

    // Start point: use the first segment's normal.
    if (i === 0) {
      const delta = v(polyline[1]).subtract(polyline[0]);
      offset = delta.perpendicular().normalize().scale(halfThickness);
    }
    // End point: use the last segment's normal.
    else if (i === polyline.length - 1) {
      const delta = v(polyline[i]).subtract(polyline[i - 1]);
      offset = delta.perpendicular().normalize().scale(halfThickness);
    }
    // Middle point: compute miter join.
    else {
      const deltaPrev = v(polyline[i]).subtract(polyline[i - 1]);
      const deltaNext = v(polyline[i + 1]).subtract(polyline[i]);

      const normal1 = deltaPrev.perpendicular().normalize();
      const normal2 = deltaNext.perpendicular().normalize();

      offset = normal1.clone().add(normal2).normalize();

      const dot = offset.dot(normal1);
      const miterLength = Math.abs(dot) < 1e-6 ? halfThickness : halfThickness / dot; // prettier-ignore

      offset.scale(miterLength);
    }

    leftOffsets.push(v(polyline[i]).add(offset));
    rightOffsets.push(v(polyline[i]).subtract(offset));
  }

  return [...leftOffsets, ...rightOffsets.reverse()];
}
