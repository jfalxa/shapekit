import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export * from "./arc";
export * from "./bezier2";
export * from "./bezier3";
export * from "./corner";
export * from "./line";
export * from "./move";
export * from "./rect";
export * from "./rounded-rect";
export * from "./segment";

export type Path = (Segment | Vec2)[];

const LAST_POINT = new Vec2(0, 0);
const POINT = new Vec2(0, 0);
const MIRROR_POINT = new Vec2(0, 0);
const BBOX = { min: new Vec2(0, 0), max: new Vec2(0, 0) };

export function buildPath(
  path: Path,
  points: Vec2[],
  obb: BoundingBox,
  sx: number,
  sy: number
): Path2D {
  const path2D = new Path2D();

  let lastPoint = LAST_POINT;
  let lastControl: Vec2 | undefined;

  points.length = 0;

  obb.min.put(Infinity);
  obb.max.put(-Infinity);

  for (const segment of path) {
    // simple line
    if (segment instanceof Vec2) {
      const point = POINT.copy(segment).scale(sx, sy);

      path2D.lineTo(point.x, point.y);
      points.push(point);

      BBOX.min.copy(segment);
      BBOX.max.copy(segment);
      obb.merge(BBOX);

      lastPoint = segment;
      lastControl = segment;
    }
    // other segments
    else {
      let control = segment.getOptionalControl();
      if (!control) control = mirrorControl(lastPoint, lastControl);

      segment.apply(path2D, control, sx, sy);
      points.push(...segment.sample(lastPoint, control, sx, sy));
      segment.join(obb, lastPoint, control);

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
    return MIRROR_POINT.copy(lastPoint).scale(2).subtract(lastControl);
  } else if (lastPoint) {
    return lastPoint;
  }

  throw new Error("Missing control point data");
}
