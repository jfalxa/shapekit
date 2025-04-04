import { Path } from "../utils/path";
import { Shape, ShapeInit } from "../geometry/shape";
import { Vec2 } from "./vec2";

export interface RectInit extends Omit<ShapeInit, "path"> {
  width: number;
  height: number;
}

export class Rect extends Shape {
  private dimensions = new Vec2(0, 0);

  get width() {
    return this.dimensions[0];
  }

  set width(value: number) {
    this.dimensions[0] = value;
    this.path.clear().rect(0, 0, this.dimensions[0], this.dimensions[1]);
    this.rebuild();
  }

  get height() {
    return this.dimensions[1];
  }

  set height(value: number) {
    this.dimensions[1] = value;
    this.path.clear().rect(0, 0, this.dimensions[0], this.dimensions[1]);
    this.rebuild();
  }

  constructor(rectInit: RectInit) {
    const path = new Path().rect(0, 0, rectInit.width, rectInit.height);

    super({ ...rectInit, path });

    this.dimensions[0] = rectInit.width;
    this.dimensions[1] = rectInit.height;
  }
}
