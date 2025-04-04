import { Shape } from "../geometry/shape";

const pairs: number[] = [];

/**
 * Returns a list of numbers representing couples of indices of shapes inside the passed `shapes` array.
 * Couples listed in the returned array match two shapes with overlapping AABBs.
 * The returned list is flat, so you should visit it two by two: [a1, b1, a2, b2, a3, b3, ...]
 */
export function sweepAndPrune(shapes: Shape[]): number[] {
  const count = shapes.length;

  pairs.length = 0;

  // Create an array of indices
  const indices = new Array<number>(shapes.length);
  for (let i = 0; i < shapes.length; i++) indices[i] = i;
  // Sort indices based on each AABB's minX value.
  indices.sort((i, j) => shapes[i].aabb.min[0] - shapes[j].aabb.min[0]);

  // Sweep and prune: for each AABB, only test against subsequent AABBs
  // that might overlap along the X axis.
  for (let i = 0; i < count; i++) {
    const a = shapes[indices[i]];
    // Loop over candidates that follow in the sorted order.
    for (let j = i + 1; j < count; j++) {
      const b = shapes[indices[j]];
      // If the next box's minX is greater than the current box's maxX,
      // no further boxes can overlap with 'a' in X.
      if (b.aabb.min[0] > a.aabb.max[0]) break;
      // Quick Y-axis overlap check.
      if (b.aabb.max[1] < a.aabb.min[1] || b.aabb.min[1] > a.aabb.max[1]) continue; // prettier-ignore
      // If both X and Y intervals overlap, add the pair for further SAT test.
      pairs.push(indices[i], indices[j]);
    }
  }

  return pairs;
}
