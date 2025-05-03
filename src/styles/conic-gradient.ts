import { Gradient, GradientStops } from "./gradient";

export function conicGradient(
  startAngle: number,
  x: number,
  y: number,
  stops: GradientStops
) {
  return new ConicGradient(startAngle, x, y, stops);
}

export class ConicGradient extends Gradient {
  constructor(
    public startAngle: number,
    public x: number,
    public y: number,
    stops: GradientStops
  ) {
    super(stops);
  }

  create(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createConicGradient(this.startAngle, this.x, this.y);
    this.addColorStops(gradient);
    return gradient;
  }
}
