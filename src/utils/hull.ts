import { Shape } from "../geometry/shape";

export function renderHulls(ctx: CanvasRenderingContext2D, shapes: Shape[]) {
  ctx.resetTransform();

  ctx.strokeStyle = "orange";
  ctx.lineCap = "square";
  ctx.lineWidth = 3;

  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];

    ctx.beginPath();
    ctx.moveTo(shape.hull[0][0], shape.hull[0][1]);

    for (let j = 1; j < shape.hull.length; j++) {
      ctx.lineTo(shape.hull[j][0], shape.hull[j][1]);
    }

    if (shape.fill || (shape.lineWidth ?? 1) > 1) {
      ctx.lineTo(shape.hull[0][0], shape.hull[0][1]);
    }

    ctx.stroke();
  }
}
