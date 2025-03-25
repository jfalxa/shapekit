import { Point, Vec2 } from "./vec2";
import { evenOddRule } from "../utils/even-odd-rule";
import { SAT } from "../utils/separating-axis-theorem";
import { AABB } from "../utils/aabb";

export interface ShapeInit {
  x: number;
  y: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

export class Shape {
  x: number;
  y: number;
  angle: number;

  fill?: string;
  stroke?: string;
  lineWidth?: number;

  hull: Vec2[];
  aabb: AABB;

  dirty = true;

  constructor(init: ShapeInit) {
    this.x = init.x;
    this.y = init.y;
    this.angle = init.angle ?? 0;

    this.fill = init.fill;
    this.stroke = init.stroke;
    this.lineWidth = init.lineWidth;

    this.hull = [];
    this.aabb = new AABB();

    this.watch("x");
    this.watch("y");
    this.watch("angle");
    this.watch("fill");
    this.watch("stroke");
    this.watch("lineWidth");
  }

  contains(point: Point) {
    return evenOddRule(point, this.hull);
  }

  overlaps(shape: Shape) {
    return SAT(this.hull, shape.hull);
  }

  update() {
    this.aabb.update(this.hull);
  }

  style(ctx: CanvasRenderingContext2D) {
    if (this.fill) ctx.fillStyle = this.fill;
    if (this.stroke) ctx.strokeStyle = this.stroke;
    if (this.lineWidth) ctx.lineWidth = this.lineWidth;
  }

  transform(ctx: CanvasRenderingContext2D) {
    ctx.rotate(this.angle);
    ctx.translate(this.x, this.y);
  }

  paint(ctx: CanvasRenderingContext2D) {
    ctx;
  }

  private watch(key: keyof this) {
    let cache = this[key];
    Object.defineProperty(this, key, {
      get() {
        return cache;
      },
      set(value) {
        if (cache !== value) {
          cache = value;
          this.dirty = true;
        }
      },
    });
  }
}
