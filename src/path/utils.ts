import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export type Path = (Segment | Vec2)[];

export function toPath2D(path: Path) {
  const path2D = new Path2D();

  let prevPoint = new Vec2(0, 0);
  let prevControl: Vec2 | undefined;

  for (const segment of path) {
    if (segment instanceof Vec2) {
      path2D.lineTo(segment[0], segment[1]);
      prevPoint = segment;
      prevControl = segment;
    } else {
      let control = segment.getOptionalControl();
      if (!control) control = mirrorControl(prevPoint, prevControl);

      segment.apply(path2D, control);

      prevPoint = segment.getEndPoint();
      prevControl = segment.getSharedControl();
    }
  }

  return path2D;
}

export function toPoints(path: Path) {
  const points: Vec2[] = [];

  let prevPoint = new Vec2(0, 0);
  let prevControl: Vec2 | undefined;

  for (const segment of path) {
    if (segment instanceof Vec2) {
      points.push(segment);
      prevPoint = segment;
      prevControl = segment;
    } else {
      let control = segment.getOptionalControl();
      if (!control) control = mirrorControl(prevPoint, prevControl);

      const subpoints = segment.sample(prevPoint, control);
      points.push(...subpoints);

      prevPoint = segment.getEndPoint();
      prevControl = segment.getSharedControl();
    }
  }

  return points;
}

export function toAABB(path: Path, lineWidth = 0, out = new BoundingBox()) {
  out.min.put(Infinity);
  out.max.put(-Infinity);

  let prevPoint = new Vec2(0, 0);
  let prevControl: Vec2 | undefined;

  const bbox = { min: new Vec2(0, 0), max: new Vec2(0, 0) };

  for (const segment of path) {
    if (segment instanceof Vec2) {
      bbox.min.copy(prevPoint).min(segment);
      bbox.max.copy(prevPoint).max(segment);
      out.merge(bbox);
      prevPoint = segment;
      prevControl = segment;
    } else {
      let control = segment.getOptionalControl();
      if (!control) control = mirrorControl(prevPoint, prevControl);

      segment.join(out, prevPoint, control);

      prevPoint = segment.getEndPoint();
      prevControl = segment.getSharedControl();
    }
  }

  if (lineWidth) {
    const halfWidth = lineWidth / 2;
    out.min.translate(-halfWidth, -halfWidth);
    out.max.translate(halfWidth, halfWidth);

    out.a.copy(out.min);
    out.b.put(out.max[0], out.min[1]);
    out.c.copy(out.max);
    out.d.put(out.min[0], out.max[1]);
  }

  return out;
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
