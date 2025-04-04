import { Loop, Task } from "vroum";
import { Shape } from "../geometry/shape";
import { renderHulls } from "../utils/hull";

export class Renderer extends Task {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  shapes: Shape[] = [];

  // Helper: initialize WebGL context on a given canvas
  constructor(canvas: HTMLCanvasElement, loop: Loop) {
    super(loop);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas2D not supported in your browser");

    this.canvas = canvas;
    this.ctx = ctx;
  }

  tick() {
    const { ctx, canvas } = this;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.shapes.length; i++) {
      this.render(this.shapes[i]);
    }

    renderHulls(ctx, this.shapes);
  }

  add(...shapes: Shape[]) {
    this.shapes.push(...shapes);
  }

  render(shape: Shape) {
    const { ctx } = this;

    ctx.setTransform(
      shape.transform[0],
      shape.transform[1],
      shape.transform[3],
      shape.transform[4],
      shape.transform[6],
      shape.transform[7]
    );

    const {
      shadowBlur = 0,
      shadowColor = "black",
      shadowOffsetX = 0,
      shadowOffsetY = 0,
    } = shape;

    if (shadowBlur !== ctx.shadowBlur) ctx.shadowBlur = shadowBlur;
    if (shadowColor !== ctx.shadowColor) ctx.shadowColor = shadowColor;
    if (shadowOffsetX !== ctx.shadowOffsetX) ctx.shadowOffsetX = shadowOffsetX;
    if (shadowOffsetY !== ctx.shadowOffsetY) ctx.shadowOffsetY = shadowOffsetY;

    if (shape.fill) {
      if (shape.fill !== ctx.fillStyle) ctx.fillStyle = shape.fill;
      ctx.fill(shape.path2D);
    }

    if (shape.stroke) {
      const {
        lineWidth = 1,
        lineCap = "butt",
        lineJoin = "miter",
        lineDashOffset = 0,
        miterLimit = 0,
      } = shape;

      if (lineWidth !== ctx.lineWidth) ctx.lineWidth = lineWidth;
      if (lineCap !== ctx.lineCap) ctx.lineCap = lineCap;
      if (lineJoin !== ctx.lineJoin) ctx.lineJoin = lineJoin;
      if (lineDashOffset !== ctx.lineDashOffset) ctx.lineDashOffset = lineDashOffset; // prettier-ignore
      if (miterLimit !== ctx.miterLimit) ctx.miterLimit = miterLimit;
      if (shape.stroke !== ctx.strokeStyle) ctx.strokeStyle = shape.stroke;

      ctx.stroke(shape.path2D);
    }
  }
}
