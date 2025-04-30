export type GradientStops = Record<number, string>;

export abstract class Gradient {
  constructor(public stops: GradientStops) {}

  abstract create(ctx: CanvasRenderingContext2D): CanvasGradient;

  addColorStops(gradient: CanvasGradient) {
    for (const offsetKey in this.stops) {
      const offset = parseInt(offsetKey) / 100;
      gradient.addColorStop(offset, this.stops[offsetKey]);
    }
  }
}
