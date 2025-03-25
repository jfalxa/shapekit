import { Polygon } from "../geometry/polygon";

export function sweepAndPrune(polygons: Polygon[]): [number, number][] {
  const pairs: [number, number][] = [];
  const count = polygons.length;

  // Create an array of indices
  const indices = new Array<number>(polygons.length);
  for (let i = 0; i < polygons.length; i++) indices[i] = i;
  // Sort indices based on each AABB's minX value.
  indices.sort((i, j) => polygons[i].aabb.min.x - polygons[j].aabb.min.x);

  // Sweep and prune: for each AABB, only test against subsequent AABBs
  // that might overlap along the X axis.
  for (let i = 0; i < count; i++) {
    const a = polygons[indices[i]];
    // Loop over candidates that follow in the sorted order.
    for (let j = i + 1; j < count; j++) {
      const b = polygons[indices[j]];
      // If the next box's minX is greater than the current box's maxX,
      // no further boxes can overlap with 'a' in X.
      if (b.aabb.min.x > a.aabb.max.x) break;
      // Quick Y-axis overlap check.
      if (b.aabb.max.y < a.aabb.min.y || b.aabb.min.y > a.aabb.max.y) continue;
      // If both X and Y intervals overlap, add the pair for further SAT test.
      pairs.push([indices[i], indices[j]]);
    }
  }
  return pairs;
}
