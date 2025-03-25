import { Point, v, Vec2 } from "./vec2";
import { Shape, ShapeInit } from "./shape";
import { createPath } from "../utils/path";

export interface PolygonInit extends ShapeInit {
  shape: Point[];
}

export class Polygon extends Shape {
  shape: Vec2[];
  path: Path2D;

  constructor(init: PolygonInit) {
    super(init);
    this.shape = init.shape.map(v);
    this.path = createPath(init.shape, true);
    this.hull.push(...init.shape.map(v));
  }

  update() {
    this.hull.length = this.shape.length;
    for (let i = 0; i < this.hull.length; i++) {
      this.hull[i].copy(this.shape[i]).add(this);
    }
    super.update();
  }

  paint(ctx: CanvasRenderingContext2D) {
    if (this.fill) ctx.fill(this.path);
    if (this.stroke) ctx.stroke(this.path);
  }
}
