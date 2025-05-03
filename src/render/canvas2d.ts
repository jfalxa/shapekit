import { Gradient } from "../gradients/gradient";
import { Group } from "../shapes/group";
import { Image } from "../shapes/image";
import { Renderable } from "../shapes/renderable";
import { Shape } from "../shapes/shape";
import { Text } from "../shapes/text";

type Canvas2D = CanvasRenderingContext2D;

export function renderAll(ctx: Canvas2D, renderables: Renderable[]) {
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < renderables.length; i++) {
    render(ctx, renderables[i]);
  }
}

export function render(ctx: Canvas2D, renderable: Renderable) {
  if (renderable instanceof Group) {
    renderGroup(ctx, renderable);
  }

  if (renderable instanceof Shape) {
    ctx.setTransform(
      renderable.transform[0],
      renderable.transform[1],
      renderable.transform[3],
      renderable.transform[4],
      renderable.transform[6],
      renderable.transform[7]
    );

    applyEffects(ctx, renderable);

    if (renderable.fill) renderFill(ctx, renderable);
    if (renderable.stroke) renderStroke(ctx, renderable);
    if (renderable instanceof Image) renderImage(ctx, renderable);
    if (renderable instanceof Text) renderText(ctx, renderable);
  }
}

function renderGroup(ctx: Canvas2D, group: Group) {
  const { children, globalCompositeOperation = "source-over" } = group;

  if (globalCompositeOperation !== ctx.globalCompositeOperation) {
    ctx.globalCompositeOperation = globalCompositeOperation;
  }

  for (let i = 0; i < children.length; i++) {
    render(ctx, children[i]);
  }
}

function renderFill(ctx: Canvas2D, shape: Shape) {
  const fill = resolveColor(ctx, shape.fill);
  if (fill !== ctx.fillStyle) ctx.fillStyle = fill;
  ctx.fill(shape.path2D);
}

function renderStroke(ctx: Canvas2D, shape: Shape) {
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

  const stroke = resolveColor(ctx, shape.stroke);
  if (stroke !== ctx.strokeStyle) ctx.strokeStyle = stroke;

  ctx.stroke(shape.path2D);
}

function renderImage(ctx: Canvas2D, image: Image) {
  const { width, height } = image;
  ctx.drawImage(image.image, 0, 0, width, height);
}

function renderText(ctx: Canvas2D, text: Text) {
  const {
    lines,
    font,
    fontSize = 12,
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

  const minY = 0 + padding;
  const maxY = text.height - padding;

  let x = text.width / 2;
  if (textAlign === "left") x = padding;
  if (textAlign === "right") x = text.width - padding;

  let y = 0;
  if (textPosition === "top") y = padding;
  if (textPosition === "middle") y = -text.height / 2;
  if (textPosition === "bottom") y = text.height - padding - textHeight;

  for (let i = 0; i < lines.length; i++) {
    y += lineHeight;

    if (y - minY < 1e-6) continue;
    if (y - maxY > 1e-6) continue;

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

function applyEffects(ctx: Canvas2D, shape: Shape) {
  const {
    globalAlpha = 1,
    filter = "none",
    shadowBlur = 0,
    shadowColor = "#000000",
    shadowOffsetX = 0,
    shadowOffsetY = 0,
  } = shape;

  if (globalAlpha !== ctx.globalAlpha) ctx.globalAlpha = globalAlpha;
  if (filter !== ctx.filter) ctx.filter = filter;
  if (shadowBlur !== ctx.shadowBlur) ctx.shadowBlur = shadowBlur;
  if (shadowColor !== ctx.shadowColor) ctx.shadowColor = shadowColor;
  if (shadowOffsetX !== ctx.shadowOffsetX) ctx.shadowOffsetX = shadowOffsetX;
  if (shadowOffsetY !== ctx.shadowOffsetY) ctx.shadowOffsetY = shadowOffsetY;
}

const GRADIENTS = new WeakMap<Gradient, CanvasGradient>();

function resolveColor(
  ctx: CanvasRenderingContext2D,
  color: string | Gradient | undefined
) {
  if (!color) return "#000000";
  if (typeof color === "string") return color;
  if (GRADIENTS.has(color)) return GRADIENTS.get(color)!;

  const gradient = color.create(ctx);
  GRADIENTS.set(color, gradient);
  return gradient;
}
