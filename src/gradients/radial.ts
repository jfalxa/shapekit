import { Gradient, GradientStops } from "./gradient";

export function radialGradient(
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  stops: GradientStops
) {
  return new RadialGradient(x0, y0, r0, x1, y1, r1, stops);
}

export class RadialGradient extends Gradient {
  constructor(
    public x0: number,
    public y0: number,
    public r0: number,
    public x1: number,
    public y1: number,
    public r1: number,
    stops: GradientStops
  ) {
    super(stops);
  }

  create(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createRadialGradient(
      this.x0,
      this.y0,
      this.r0,
      this.x1,
      this.y1,
      this.r1
    );

    this.addColorStops(gradient);
    return gradient;
  }
}
