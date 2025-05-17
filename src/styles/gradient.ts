export type GradientStops = Record<number, string>;

export abstract class Gradient {
  private __gradient?: CanvasGradient;

  constructor(public stops: GradientStops) {}

  abstract create(ctx: CanvasRenderingContext2D): CanvasGradient;

  get(ctx: CanvasRenderingContext2D) {
    if (!this.__gradient) this.__gradient = this.create(ctx);
    return this.__gradient;
  }

  addColorStops(gradient: CanvasGradient) {
    for (const offsetKey in this.stops) {
      const offset = parseInt(offsetKey) / 100;
      gradient.addColorStop(offset, this.stops[offsetKey]);
    }
  }
}
