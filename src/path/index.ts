import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export * from "./arc";
export * from "./bezier2";
export * from "./bezier3";
export * from "./corner";
export * from "./line";
export * from "./move";
export * from "./rect";
export * from "./round-rect";
export * from "./segment";

export type Path = (Segment | Vec2)[];

export function buildPath(
  path: Path,
  points: Vec2[],
  obb: BoundingBox,
  sx: number,
  sy: number,
  quality: number
): Path2D {
  const path2D = new Path2D();

  let lastPoint = new Vec2(0, 0);
  let lastControl: Vec2 | undefined;

  points.length = 0;

  const bbox = { min: new Vec2(0, 0), max: new Vec2(0, 0) };
  obb.min.put(Infinity);
  obb.max.put(-Infinity);

  for (const segment of path) {
    // simple line
    if (segment instanceof Vec2) {
      const point = v(segment).scale(sx, sy);

      path2D.lineTo(point.x, point.y);
      points.push(point);

      bbox.min.copy(segment);
      bbox.max.copy(segment);
      obb.merge(bbox);

      lastPoint = segment;
      lastControl = segment;
    }
    // other segments
    else {
      let control = segment.getOptionalControl();
      if (!control) control = mirrorControl(lastPoint, lastControl);

      segment.apply(path2D, control, sx, sy);
      points.push(...segment.sample(lastPoint, control, sx, sy, quality));
      segment.join(obb, lastPoint, control, sx, sy);

      lastPoint = segment.getEndPoint();
      lastControl = segment.getSharedControl();
    }
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
