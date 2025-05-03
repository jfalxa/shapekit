export type GradientStops = Record<number, string>;

export abstract class Gradient {
  #gradient?: CanvasGradient;

  constructor(public stops: GradientStops) {}

  abstract create(ctx: CanvasRenderingContext2D): CanvasGradient;

  get(ctx: CanvasRenderingContext2D) {
    if (!this.#gradient) this.#gradient = this.create(ctx);
    return this.#gradient;
  }

  addColorStops(gradient: CanvasGradient) {
    for (const offsetKey in this.stops) {
      const offset = parseInt(offsetKey) / 100;
      gradient.addColorStop(offset, this.stops[offsetKey]);
    }
  }
}
