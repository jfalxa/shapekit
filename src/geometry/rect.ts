import { Path } from "../utils/path";
import { Shape, ShapeInit } from "../geometry/shape";

export interface RectInit extends Omit<ShapeInit, "path"> {
  width: number;
  height: number;
}

export class Rect extends Shape {
  constructor(init: RectInit) {
    const left = -init.width / 2;
    const right = init.width / 2;
    const top = -init.height / 2;
    const bottom = init.height / 2;

    const path = new Path()
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .close();

    super({ ...init, path });
  }
}
