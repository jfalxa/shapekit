import { Shape } from "../webgl/shape";

export function sweepAndPrune(shapes: Shape[]): [number, number][] {
  const pairs: [number, number][] = [];
  const count = shapes.length;

  // Create an array of indices
  const indices = new Array<number>(shapes.length);
  for (let i = 0; i < shapes.length; i++) indices[i] = i;
  // Sort indices based on each AABB's minX value.
  indices.sort((i, j) => shapes[i].aabb.min.x - shapes[j].aabb.min.x);

  // Sweep and prune: for each AABB, only test against subsequent AABBs
  // that might overlap along the X axis.
  for (let i = 0; i < count; i++) {
    const a = shapes[indices[i]];
    // Loop over candidates that follow in the sorted order.
    for (let j = i + 1; j < count; j++) {
      const b = shapes[indices[j]];
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
