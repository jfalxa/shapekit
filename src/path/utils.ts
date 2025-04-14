import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export type Path = (Segment | Vec2)[];

export function parse(
  path: Path,
  sx: number,
  sy: number
): [Path2D, Vec2[], BoundingBox] {
  const path2D = new Path2D();
  const points: Vec2[] = [];
  const aabb = new BoundingBox();

  aabb.min.put(Infinity);
  aabb.max.put(-Infinity);

  let prevPoint = new Vec2(0, 0);
  let prevControl: Vec2 | undefined;

  const bbox = {
    min: new Vec2(0, 0),
    max: new Vec2(0, 0),
  };

  for (const segment of path) {
    // simple line
    if (segment instanceof Vec2) {
      const point = v(segment).scale(sx, sy);

      path2D.lineTo(point.x, point.y);
      points.push(point);

      bbox.min.copy(segment);
      bbox.max.copy(segment);
      aabb.merge(bbox);

      prevPoint = segment;
      prevControl = segment;
    }
    // other segments
    else {
      let control = segment.getOptionalControl();
      if (!control) control = mirrorControl(prevPoint, prevControl);

      segment.apply(path2D, control, sx, sy);
      points.push(...segment.sample(prevPoint, control, sx, sy));
      segment.join(aabb, prevPoint, control);

      prevPoint = segment.getEndPoint();
      prevControl = segment.getSharedControl();
    }
  }

  return [path2D, points, aabb];
}

export function mirrorControl(
  prevPoint: Vec2 | undefined,
  prevControl: Vec2 | undefined
) {
  // previous is a curve: mirror lastControl by prevPoint
  if (prevPoint && prevControl) {
    return v(prevPoint).scale(2).subtract(prevControl);
  }
  // previous is not a curve
  else if (prevPoint) {
    return prevPoint;
  }

  throw new Error("Missing control point data");
}
