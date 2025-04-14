import { Group } from "../shapes/group";
import { Image } from "../shapes/image";
import { Renderable } from "../shapes/renderable";
import { Shape } from "../shapes/shape";

type Canvas2D = CanvasRenderingContext2D;

export function renderHulls(ctx: Canvas2D, renderables: Renderable[]) {
  ctx.resetTransform();

  ctx.strokeStyle = "lime";
  ctx.lineCap = "square";
  ctx.lineWidth = 3;

  ctx.shadowBlur = 0;
  ctx.shadowColor = "black";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  for (const shape of flattenRenderables(renderables)) {
    if (!(shape instanceof Shape)) continue;
    if (shape.path.length === 0 || shape.hull.length === 0) continue;

    ctx.beginPath();
    ctx.moveTo(shape.hull[0][0], shape.hull[0][1]);

    for (let j = 1; j < shape.hull.length; j++) {
      ctx.lineTo(shape.hull[j][0], shape.hull[j][1]);
    }

    if (shape.fill || shape instanceof Image) {
      ctx.lineTo(shape.hull[0][0], shape.hull[0][1]);
    }

    ctx.stroke();
  }
}

export function renderOBB(ctx: Canvas2D, renderables: Renderable[]) {
  ctx.resetTransform();

  ctx.strokeStyle = "orange";
  ctx.lineCap = "square";
  ctx.lineWidth = 4;

  ctx.shadowBlur = 0;
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  for (const shape of flattenRenderables(renderables)) {
    if (shape instanceof Group) {
      renderOBB(ctx, shape.children);
    }

    ctx.beginPath();
    ctx.moveTo(shape.obb.a.x, shape.obb.a.y);
    ctx.lineTo(shape.obb.b.x, shape.obb.b.y);
    ctx.lineTo(shape.obb.c.x, shape.obb.c.y);
    ctx.lineTo(shape.obb.d.x, shape.obb.d.y);
    ctx.closePath();

    ctx.stroke();
  }
}

function flattenRenderables(renderables: Renderable[]) {
  const flat: Renderable[] = [];
  for (const renderable of renderables) {
    flat.push(renderable);
    if (renderable instanceof Group) {
      flat.push(...flattenRenderables(renderable.children));
    }
  }
  return flat;
}
