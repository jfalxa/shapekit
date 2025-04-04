import { Vec2 } from "../geometry/vec2";

export function sampleQuadraticBezier(
  p0: Vec2,
  p1: Vec2,
  p2: Vec2,
  segments = 10
): Vec2[] {
  const points: Vec2[] = [];
  for (let t = 0; t <= 1; t += 1 / segments) {
    const x =
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y =
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    points.push(new Vec2(x, y));
  }
  return points;
}

export function sampleCubicBezier(
  p0: Vec2,
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  segments = 10
): Vec2[] {
  const points: Vec2[] = [];
  for (let t = 0; t <= 1; t += 1 / segments) {
    const x =
      (1 - t) ** 3 * p0[0] +
      3 * (1 - t) ** 2 * t * p1[0] +
      3 * (1 - t) * t ** 2 * p2[0] +
      t ** 3 * p3[0];

    const y =
      (1 - t) ** 3 * p0[1] +
      3 * (1 - t) ** 2 * t * p1[1] +
      3 * (1 - t) * t ** 2 * p2[1] +
      t ** 3 * p3[1];

    points.push(new Vec2(x, y));
  }
  return points;
}
