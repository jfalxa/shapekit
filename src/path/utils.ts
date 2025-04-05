import { v, Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export type Path = Segment[];

export function toPath2D(path: Path) {
  const path2D = new Path2D();

  let prevPoint = new Vec2(0, 0);
  let prevControl: Vec2 | undefined;

  for (const segment of path) {
    let control = segment.getOptionalControl();
    if (!control) control = mirrorControl(prevPoint, prevControl);

    segment.apply(path2D, control);

    prevPoint = segment.getEndPoint();
    prevControl = segment.getSharedControl();
  }

  return path2D;
}

export function toPoints(path: Path) {
  const points: Vec2[] = [];

  let prevPoint = new Vec2(0, 0);
  let prevControl: Vec2 | undefined;

  for (const segment of path) {
    let control = segment.getOptionalControl();
    if (!control) control = mirrorControl(prevPoint, prevControl);

    const subpoints = segment.sample(prevPoint, control);
    points.push(...subpoints);

    prevPoint = segment.getEndPoint();
    prevControl = segment.getSharedControl();
  }

  return points;
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
