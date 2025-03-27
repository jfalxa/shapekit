import { Shape, ShapeInit } from "../webgl/shape";

const vertices = [
  { x: -0.5, y: -0.5 },
  { x: 0.5, y: -0.5 },
  { x: 0.5, y: 0.5 },
  { x: -0.5, y: 0.5 },
];

export interface RectInit extends Omit<ShapeInit, "vertices"> {
  width: number;
  height: number;
}

export class Rect extends Shape {
  constructor(init: RectInit) {
    super({ ...init, vertices });
  }
}
