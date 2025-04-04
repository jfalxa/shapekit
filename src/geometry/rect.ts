import { Path } from "../utils/path";
import { Shape, ShapeInit } from "../geometry/shape";

export interface RectInit extends Omit<ShapeInit, "path"> {
  width: number;
  height: number;
}

export class Rect extends Shape {
  width: number;
  height: number;

  constructor(rectInit: RectInit) {
    const left = -rectInit.width / 2;
    const right = rectInit.width / 2;
    const top = -rectInit.height / 2;
    const bottom = rectInit.height / 2;

    const path = new Path()
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .close();

    super({ ...rectInit, path });

    this.width = rectInit.width;
    this.height = rectInit.height;
  }
}
