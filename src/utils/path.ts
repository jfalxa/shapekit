import { Vec2 } from "../geometry/vec2";

export type PathPart =
  | { type: "move"; to: Vec2 }
  | { type: "line"; to: Vec2 }
  | { type: "bezier2"; to: Vec2; control?: Vec2 }
  | { type: "bezier3"; to: Vec2; startControl?: Vec2; endControl: Vec2 }
  | { type: "arc"; to: Vec2; control: Vec2; radius: number }
  | { type: "close" };

export class Path {
  parts: PathPart[] = [];

  clear() {
    this.parts.length = 0;
    return this;
  }

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

  rect(x: number, y: number, width: number, height: number) {
    const left = x - width / 2;
    const right = x + width / 2;
    const top = y - height / 2;
    const bottom = y + height / 2;

    return this.moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .close();
  }

  roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    const left = x - width / 2;
    const right = x + width / 2;
    const top = y - height / 2;
    const bottom = y + height / 2;

    return this.moveTo(left, 0)
      .arcTo(0, top, left, top, radius)
      .arcTo(right, 0, right, top, radius)
      .arcTo(0, bottom, right, bottom, radius)
      .arcTo(left, 0, left, bottom, radius);
  }

  close() {
    this.parts.push({ type: "close" });
    return this;
  }
}
