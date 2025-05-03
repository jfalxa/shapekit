import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export type Path = Segment[];

export function buildPath(
  path: Path,
  points: Vec2[],
  obb: BoundingBox,
  quality: number
): Path2D {
  const path2D = new Path2D();

  let previousSegment: Segment | undefined;

  points.length = 0;

  obb.min.put(Infinity);
  obb.max.put(-Infinity);

  for (const segment of path) {
    segment.link(previousSegment);

    segment.apply(path2D);
    points.push(...segment.sample(quality));
    segment.join(obb);

    previousSegment = segment;
  }

  return path2D;
}
