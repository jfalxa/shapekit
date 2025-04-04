import { Vec2 } from "../geometry/vec2";
import { sampleCubicBezier, sampleQuadraticBezier } from "./bezier";
import { sampleArcTo } from "./arc";

type PathPart =
  | { type: "move"; to: Vec2 }
  | { type: "line"; to: Vec2 }
  | { type: "bezier2"; to: Vec2; control?: Vec2 }
  | { type: "bezier3"; to: Vec2; startControl?: Vec2; endControl: Vec2 }
  | { type: "arc"; to: Vec2; control: Vec2; radius: number }
  | { type: "close" };

export class Path {
  parts: PathPart[] = [];

  moveTo(x: number, y: number): this {
    this.parts.push({
      type: "move",
      to: new Vec2(x, y),
    });
    return this;
  }

  lineTo(x: number, y: number): this {
    this.parts.push({
      type: "line",
      to: new Vec2(x, y),
    });
    return this;
  }

  arcTo(x: number, y: number, cx: number, cy: number, r: number): this {
    this.parts.push({
      type: "arc",
      to: new Vec2(x, y),
      control: new Vec2(cx, cy),
      radius: r,
    });
    return this;
  }

  quadraticBezierTo(
    x: number,
    y: number,
    cpx?: number, // optional control point to create smooth curves
    cpy?: number
  ): this {
    let cp: Vec2 | undefined;
    if (cpx !== undefined && cpy !== undefined) cp = new Vec2(cpx, cpy);
    this.parts.push({
      type: "bezier2",
      to: new Vec2(x, y),
      control: cp,
    });
    return this;
  }

  cubicBezierTo(
    x: number,
    y: number,
    startX: number,
    startY: number,
    endX?: number, // optional 2nd control points to create smooth curves
    endY?: number
  ): this {
    let start: Vec2 | undefined;
    let end: Vec2;

    if (endX !== undefined && endY !== undefined) {
      start = new Vec2(startX, startY);
      end = new Vec2(endX, endY);
    } else {
      end = new Vec2(startX, startY);
    }

    this.parts.push({
      type: "bezier3",
      to: new Vec2(x, y),
      startControl: start,
      endControl: end,
    });

    return this;
  }

  close() {
    this.parts.push({ type: "close" });
    return this;
  }

  toPath2D() {
    const path = new Path2D();
    let control: Vec2 | undefined;
    let lastPoint: Vec2 | undefined;
    let lastControl: Vec2 | undefined;
    for (const part of this.parts) {
      switch (part.type) {
        case "move":
          path.moveTo(part.to.x, part.to.y);
          lastPoint = part.to;
          lastControl = undefined;
          break;
        case "line":
          path.lineTo(part.to.x, part.to.y);
          lastPoint = part.to;
          lastControl = undefined;
          break;
        case "arc":
          path.arcTo(part.control.x, part.control.y, part.to.x, part.to.y, part.radius); // prettier-ignore
          path.lineTo(part.to.x, part.to.y);
          lastPoint = part.to;
          lastControl = undefined;
          break;
        case "bezier2":
          control = getControl(part, lastPoint, lastControl);
          path.quadraticCurveTo(control.x, control.y, part.to.x, part.to.y);
          lastPoint = part.to;
          lastControl = control;
          break;
        case "bezier3":
          control = getControl(part, lastPoint, lastControl);
          path.bezierCurveTo(control.x, control.y, part.endControl.x, part.endControl.y, part.to.x, part.to.y); // prettier-ignore
          lastPoint = part.to;
          lastControl = part.endControl;
          break;
        case "close":
          path.closePath();
          lastPoint = undefined;
          lastControl = undefined;
          break;
      }
    }
    return path;
  }

  toPoints() {
    const points: Vec2[] = [];
    let lastPoint: Vec2 = Vec2.ZERO;
    let control: Vec2 | undefined;
    for (const part of this.parts) {
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
