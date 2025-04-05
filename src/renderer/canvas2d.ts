import { Loop, Task } from "vroum";
import { Shape } from "../shapes/shape";
import { renderHulls } from "../utils/hull";
import { Image } from "../shapes/image";
import { Text } from "../shapes/text";

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
    this.ctx.setTransform(
      shape.transformation[0],
      shape.transformation[1],
      shape.transformation[3],
      shape.transformation[4],
      shape.transformation[6],
      shape.transformation[7]
    );

    this.renderShadows(shape);

    if (shape.fill) this.renderFill(shape);
    if (shape.stroke) this.renderStroke(shape);
    if (shape instanceof Image) this.renderImage(shape);
    if (shape instanceof Text) this.renderText(shape);
  }

  renderShadows(shape: Shape) {
    const { ctx } = this;
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
  }

  renderFill(shape: Shape) {
    const { ctx } = this;
    if (shape.fill !== ctx.fillStyle) ctx.fillStyle = shape.fill!;
    ctx.fill(shape.path2D);
  }

  renderStroke(shape: Shape) {
    const { ctx } = this;
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
    if (shape.stroke !== ctx.strokeStyle) ctx.strokeStyle = shape.stroke!;

    ctx.stroke(shape.path2D);
  }

  renderImage(image: Image) {
    const { ctx } = this;
    const { width, height } = image.bb;
    ctx.drawImage(image.image, -width / 2, -height / 2, width, height);
  }

  renderText(text: Text) {
    const { ctx } = this;
    const {
      lines,
      font,
      fontSize = 16,
      lineHeight = fontSize,
      textFill,
      textStroke,
      textLineWidth = 1,
      textAlign = "left",
      textBaseline = "alphabetic",
      textPosition = "top",
      padding = 0,
    } = text;

    if (font !== ctx.font) ctx.font = font;
    if (textAlign !== ctx.textAlign) ctx.textAlign = textAlign;
    if (textBaseline !== ctx.textBaseline) ctx.textBaseline = textBaseline;

    const textHeight = lines.length * lineHeight;
    const halfWidth = text.bb.width / 2;
    const halfHeight = text.bb.height / 2;

    const minY = -halfHeight + padding;
    const maxY = halfHeight - padding;

    let x = 0;
    if (textAlign === "left") x = -halfWidth + padding;
    if (textAlign === "right") x = halfWidth - padding;

    let y = 0;
    if (textPosition === "top") y += -halfHeight + padding;
    if (textPosition === "middle") y += -textHeight / 2;
    if (textPosition === "bottom") y += halfHeight - padding - textHeight;

    for (let i = 0; i < lines.length; i++) {
      y += lineHeight;

      if (y < minY) continue;
      if (y > maxY) continue;

      const line = lines[i];

      if (textFill) {
        if (textFill !== ctx.fillStyle) ctx.fillStyle = textFill;
        ctx.fillText(line, x, y);
      }

      if (textStroke) {
        if (textStroke !== ctx.strokeStyle) ctx.strokeStyle = textStroke;
        if (textLineWidth !== ctx.lineWidth) ctx.lineWidth = textLineWidth;
        ctx.strokeText(line, x, y);
      }
    }
  }
}
