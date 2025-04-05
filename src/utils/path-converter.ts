import { Vec2 } from "../math/vec2";
import { sampleArcTo } from "./arc";
import { sampleCubicBezier, sampleQuadraticBezier } from "./bezier";
import { Path } from "./path";

export function toPath2D(path: Path) {
  const path2D = new Path2D();
  let control: Vec2 | undefined;
  let lastPoint: Vec2 | undefined;
  let lastControl: Vec2 | undefined;
  for (const seg of path.segments) {
    switch (seg.type) {
      case "move":
        path2D.moveTo(seg.to.x, seg.to.y);
        lastPoint = seg.to;
        lastControl = undefined;
        break;
      case "line":
        path2D.lineTo(seg.to.x, seg.to.y);
        lastPoint = seg.to;
        lastControl = undefined;
        break;
      case "arc":
        path2D.arcTo(seg.control.x, seg.control.y, seg.to.x, seg.to.y, seg.radius); // prettier-ignore
        path2D.lineTo(seg.to.x, seg.to.y);
        lastPoint = seg.to;
        lastControl = undefined;
        break;
      case "bezier2":
        control = resolveControl(seg.control, lastPoint, lastControl);
        path2D.quadraticCurveTo(control.x, control.y, seg.to.x, seg.to.y);
        lastPoint = seg.to;
        lastControl = control;
        break;
      case "bezier3":
        control = resolveControl(seg.startControl, lastPoint, lastControl);
        path2D.bezierCurveTo(control.x, control.y, seg.endControl.x, seg.endControl.y, seg.to.x, seg.to.y); // prettier-ignore
        lastPoint = seg.to;
        lastControl = seg.endControl;
        break;
      case "close":
        path2D.closePath();
        lastPoint = undefined;
        lastControl = undefined;
        break;
    }
  }
  return path2D;
}

export function toPoints(path: Path) {
  const points: Vec2[] = [];
  let control: Vec2 | undefined;
  let lastPoint: Vec2 = Vec2.ZERO;
  let lastControl: Vec2 | undefined;
  for (const seg of path.segments) {
    switch (seg.type) {
      case "move":
        points.push(seg.to.clone());
        lastPoint = seg.to;
        lastControl = undefined;
        break;
      case "line":
        points.push(seg.to.clone());
        lastPoint = seg.to;
        lastControl = undefined;
        break;
      case "arc":
        points.push(...sampleArcTo(lastPoint, seg.to, seg.control, seg.radius)); // prettier-ignore
        lastPoint = seg.to;
        lastControl = undefined;
        break;
      case "bezier2":
        control = resolveControl(seg.control, lastPoint, lastControl);
        points.push(...sampleQuadraticBezier(lastPoint, control, seg.to)); // prettier-ignore
        lastPoint = seg.to;
        break;
      case "bezier3":
        control = resolveControl(seg.startControl, lastPoint, lastControl);
        points.push(...sampleCubicBezier(lastPoint, control, seg.endControl, seg.to)); // prettier-ignore
        lastPoint = seg.to;
        lastControl = seg.endControl;
        break;
    }
  }

  return points;
}

const buffer = new Vec2(0, 0);

function resolveControl(
  control: Vec2 | undefined,
  lastPoint: Vec2 | undefined,
  lastControl: Vec2 | undefined
) {
  if (control) {
    return control;
  } else if (lastPoint && lastControl) {
    return buffer.copy(lastPoint).scale(2).subtract(lastControl);
  } else if (lastPoint) {
    return lastPoint;
  }

  throw new Error("Missing control point data");
}
