import { Gradient, GradientStops } from "./gradient";

export function linearGradient(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: GradientStops
) {
  return new LinearGradient(x0, y0, x1, y1, stops);
}

export class LinearGradient extends Gradient {
  constructor(
    public x0: number,
    public y0: number,
    public x1: number,
    public y1: number,
    stops: GradientStops
  ) {
    super(stops);
  }

  create(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(
      this.x0,
      this.y0,
      this.x1,
      this.y1
    );

    this.addColorStops(gradient);
    return gradient;
  }
}
