import { v, Vec2 } from "../math/vec2";
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

  let lastPoint = new Vec2(0, 0);
  let lastControl: Vec2 | undefined;

  points.length = 0;

  obb.min.put(Infinity);
  obb.max.put(-Infinity);

  for (const segment of path) {
    let control = segment.getOptionalControl();
    if (!control) control = mirrorControl(lastPoint, lastControl);

    segment.apply(path2D, control);
    points.push(...segment.sample(lastPoint, control, quality));
    segment.join(obb, lastPoint, control);

    lastPoint = segment.getEndPoint();
    lastControl = segment.getSharedControl();
  }

  return path2D;
}

function mirrorControl(
  lastPoint: Vec2 | undefined,
  lastControl: Vec2 | undefined
) {
  // previous segment is a curve: mirror lastControl by prevPoint
  if (lastPoint && lastControl) {
    return v(lastPoint).scale(2).subtract(lastControl);
  } else if (lastPoint) {
    return lastPoint;
  }

  throw new Error("Missing control point data");
}
