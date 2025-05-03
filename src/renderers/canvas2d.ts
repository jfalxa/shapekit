import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { getStyle } from "../styles/style";

type Canvas2D = CanvasRenderingContext2D;

export function renderAll(ctx: Canvas2D, renderables: Renderable[]) {
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < renderables.length; i++) {
    ctx.save();
    render(ctx, renderables[i]);
    ctx.restore();
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
  setContext(ctx, "globalCompositeOperation", group.globalCompositeOperation);

  for (let i = 0; i < group.children.length; i++) {
    ctx.save();
    render(ctx, group.children[i]);
    ctx.restore();
  }
}

function renderFill(ctx: Canvas2D, shape: Shape) {
  setContext(ctx, "fillStyle", getStyle(ctx, shape.fill));
  ctx.fill(shape.path.path2D);
}

function renderStroke(ctx: Canvas2D, shape: Shape) {
  setContext(ctx, "lineWidth", shape.lineWidth);
  setContext(ctx, "lineCap", shape.lineCap);
  setContext(ctx, "lineJoin", shape.lineJoin);
  setContext(ctx, "lineDashOffset", shape.lineDashOffset);
  setContext(ctx, "miterLimit", shape.miterLimit);
  setContext(ctx, "strokeStyle", getStyle(ctx, shape.stroke));
  ctx.stroke(shape.path.path2D);
}

function renderImage(ctx: Canvas2D, image: Image) {
  ctx.drawImage(image.image, 0, 0, image.width, image.height);
}

function renderText(ctx: Canvas2D, text: Text) {
  const {
    lines,
    fontSize = 12,
    lineHeight = fontSize,
    textAlign = "left",
    textVerticalAlign: textPosition = "top",
    padding = 0,
  } = text;

  const minY = 0 + padding;
  const maxY = text.height - padding;

  let x = text.width / 2;
  if (textAlign === "left") x = padding;
  if (textAlign === "right") x = text.width - padding;

  let y = 0;
  if (textPosition === "top") y = padding;
  if (textPosition === "middle") y = -text.height / 2;
  if (textPosition === "bottom") y = text.height - lines.length * lineHeight - padding; // prettier-ignore

  setContext(ctx, "font", text.font);
  setContext(ctx, "textAlign", text.textAlign);
  setContext(ctx, "textBaseline", text.textBaseline);
  setContext(ctx, "fillStyle", getStyle(ctx, text.textFill));
  setContext(ctx, "strokeStyle", getStyle(ctx, text.textStroke));
  setContext(ctx, "lineWidth", text.textLineWidth);

  for (let i = 0; i < lines.length; i++) {
    y += lineHeight;
    if (y - minY < 1e-6) continue;
    if (y - maxY > 1e-6) continue;

    const line = lines[i];
    if (text.textFill) ctx.fillText(line, x, y);
    if (text.textStroke) ctx.strokeText(line, x, y);
  }
}

function applyEffects(ctx: Canvas2D, shape: Shape) {
  setContext(ctx, "globalAlpha", shape.globalAlpha);
  setContext(ctx, "filter", shape.filter);
  setContext(ctx, "shadowBlur", shape.shadowBlur);
  setContext(ctx, "shadowColor", shape.shadowColor);
  setContext(ctx, "shadowOffsetX", shape.shadowOffsetX);
  setContext(ctx, "shadowOffsetY", shape.shadowOffsetY);
}

function setContext<K extends keyof Canvas2D>(
  ctx: Canvas2D,
  property: K,
  value: Canvas2D[K] | undefined
) {
  if (value !== undefined && ctx[property] !== value) {
    ctx[property] = value;
  }
}
