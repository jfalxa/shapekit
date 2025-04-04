import { Vec2 } from "../math/vec2";
import { sampleArcTo } from "./arc";
import { sampleCubicBezier, sampleQuadraticBezier } from "./bezier";
import { Path, PathPart } from "./path";

export function toPath2D(path: Path) {
  const path2D = new Path2D();
  let control: Vec2 | undefined;
  let lastPoint: Vec2 | undefined;
  let lastControl: Vec2 | undefined;
  for (const part of path.parts) {
    switch (part.type) {
      case "move":
        path2D.moveTo(part.to.x, part.to.y);
        lastPoint = part.to;
        lastControl = undefined;
        break;
      case "line":
        path2D.lineTo(part.to.x, part.to.y);
        lastPoint = part.to;
        lastControl = undefined;
        break;
      case "arc":
        path2D.arcTo(part.control.x, part.control.y, part.to.x, part.to.y, part.radius); // prettier-ignore
        path2D.lineTo(part.to.x, part.to.y);
        lastPoint = part.to;
        lastControl = undefined;
        break;
      case "bezier2":
        control = getControl(part, lastPoint, lastControl);
        path2D.quadraticCurveTo(control.x, control.y, part.to.x, part.to.y);
        lastPoint = part.to;
        lastControl = control;
        break;
      case "bezier3":
        control = getControl(part, lastPoint, lastControl);
        path2D.bezierCurveTo(control.x, control.y, part.endControl.x, part.endControl.y, part.to.x, part.to.y); // prettier-ignore
        lastPoint = part.to;
        lastControl = part.endControl;
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
  let lastPoint: Vec2 = Vec2.ZERO;
  let control: Vec2 | undefined;
  for (const part of path.parts) {
    switch (part.type) {
      case "move":
        points.push(part.to.clone());
        lastPoint = part.to;
        control = undefined;
        break;
      case "line":
        points.push(part.to.clone());
        lastPoint = part.to;
        control = undefined;
        break;
      case "arc":
        points.push(...sampleArcTo(lastPoint, part.to, part.control, part.radius)); // prettier-ignore
        lastPoint = part.to;
        control = undefined;
        break;
      case "bezier2":
        control = getControl(part, lastPoint, control);
        points.push(...sampleQuadraticBezier(lastPoint, control, part.to)); // prettier-ignore
        lastPoint = part.to;
        break;
      case "bezier3":
        control = getControl(part, lastPoint, control);
        points.push(...sampleCubicBezier(lastPoint, control, part.endControl, part.to)); // prettier-ignore
        lastPoint = part.to;
        control = part.endControl;
        break;
    }
  }

  return points;
}

const buffer = new Vec2(0, 0);

function getControl(
  part: PathPart,
  lastPoint: Vec2 | undefined,
  lastControl: Vec2 | undefined
) {
  if (part.type !== "bezier2" && part.type !== "bezier3") throw new Error();

  let control = part.type === "bezier2" ? part.control : part.startControl;

  if (control) {
    return control;
  } else if (lastPoint && lastControl) {
    return buffer.copy(lastPoint).scale(2).subtract(lastControl);
  } else if (lastPoint) {
    return lastPoint;
  }

  throw new Error("Missing control point data");
}
