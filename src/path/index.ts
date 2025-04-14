import { Vec2 } from "../math/vec2";
import { Shape } from "../shapes/shape";
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

const POINT = new Vec2(0, 0);
const MIRROR_POINT = new Vec2(0, 0);
const BBOX = { min: new Vec2(0, 0), max: new Vec2(0, 0) };

export function buildPath(shape: Shape) {
  const { width, height, baseWidth, baseHeight, points, obb } = shape;

  let sw = 1;
  let sh = 1;

  if (width && height && baseWidth && baseHeight) {
    sw = width / baseWidth;
    sh = height / baseHeight;
  }

  const path2D = new Path2D();

  let lastPoint = new Vec2(0, 0);
  let lastControl: Vec2 | undefined;

  points.length = 0;

  obb.min.put(Infinity);
  obb.max.put(-Infinity);

  for (const segment of shape.path) {
    // simple line
    if (segment instanceof Vec2) {
      const point = POINT.copy(segment).scale(sw, sh);

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

      segment.apply(path2D, control, sw, sh);
      points.push(...segment.sample(lastPoint, control, sw, sh));
      segment.join(obb, lastPoint, control);

      lastPoint = segment.getEndPoint();
      lastControl = segment.getSharedControl();
    }
  }

  shape.path2D = path2D;

  shape.baseWidth = shape.obb.width;
  shape.baseHeight = shape.obb.height;

  shape.obb.scale(sw, sh);
  shape.width = shape.obb.width;
  shape.height = shape.obb.height;
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
