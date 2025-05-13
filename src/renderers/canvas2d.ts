import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Mask } from "../renderables/mask";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { getStyle } from "../styles/style";

type Canvas2D = CanvasRenderingContext2D;

export function render(ctx: Canvas2D, renderables: Renderable[]) {
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < renderables.length; i++) {
    renderOne(ctx, renderables[i]);
  }
}

export function renderOne(ctx: Canvas2D, renderable: Renderable) {
  if (renderable instanceof Mask) {
    return renderMask(ctx, renderable);
  }

  ctx.save();

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

  ctx.restore();
}

function renderMask(ctx: Canvas2D, mask: Mask) {
  ctx.clip(mask.path.path2D);
}

function renderGroup(ctx: Canvas2D, group: Group) {
  set(ctx, "globalCompositeOperation", group.globalCompositeOperation);

  for (let i = 0; i < group.children.length; i++) {
    renderOne(ctx, group.children[i]);
  }
}

function renderFill(ctx: Canvas2D, shape: Shape) {
  set(ctx, "fillStyle", getStyle(ctx, shape.fill));
  ctx.fill(shape.path.path2D);
}

function renderStroke(ctx: Canvas2D, shape: Shape) {
  set(ctx, "lineWidth", shape.lineWidth);
  set(ctx, "lineCap", shape.lineCap);
  set(ctx, "lineJoin", shape.lineJoin);
  set(ctx, "miterLimit", shape.miterLimit);
  set(ctx, "strokeStyle", getStyle(ctx, shape.stroke));
  set(ctx, "lineDashOffset", shape.lineDashOffset);
  if (shape.lineDash) ctx.setLineDash(shape.lineDash);
  ctx.stroke(shape.path.path2D);
}

function renderImage(ctx: Canvas2D, image: Image) {
  ctx.drawImage(image.image, 0, 0, image.width, image.height);
}

function renderText(ctx: Canvas2D, text: Text) {
  set(ctx, "font", text.font);
  set(ctx, "textAlign", text.textAlign);
  set(ctx, "textBaseline", text.textBaseline);
  set(ctx, "fillStyle", getStyle(ctx, text.textFill));
  set(ctx, "strokeStyle", getStyle(ctx, text.textStroke));
  set(ctx, "lineWidth", text.textLineWidth);
  set(ctx, "lineDashOffset", text.lineDashOffset);
  if (text.lineDash) ctx.setLineDash(text.lineDash);

  for (let i = 0; i < text.lines.length; i++) {
    const [line, x, y] = text.lines[i];
    if (text.textFill) ctx.fillText(line, x, y);
    if (text.textStroke) ctx.strokeText(line, x, y);
  }
}

function applyEffects(ctx: Canvas2D, shape: Shape) {
  set(ctx, "globalAlpha", shape.globalAlpha);
  set(ctx, "filter", shape.filter);
  set(ctx, "shadowBlur", shape.shadowBlur);
  set(ctx, "shadowColor", shape.shadowColor);
  set(ctx, "shadowOffsetX", shape.shadowOffsetX);
  set(ctx, "shadowOffsetY", shape.shadowOffsetY);
}

function set<K extends keyof Canvas2D>(
  ctx: Canvas2D,
  property: K,
  value: Canvas2D[K] | undefined
) {
  if (value !== undefined && ctx[property] !== value) {
    ctx[property] = value;
  }
}
