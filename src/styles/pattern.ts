export type PatternRepetition =
  | "repeat"
  | "repeat-x"
  | "repeat-y"
  | "no-repeat";

export class Pattern {
  #pattern?: CanvasPattern;

  constructor(
    public image: CanvasImageSource,
    public repetition: PatternRepetition
  ) {}

  create(ctx: CanvasRenderingContext2D) {
    return ctx.createPattern(this.image, this.repetition)!;
  }

  get(ctx: CanvasRenderingContext2D) {
    if (!this.#pattern) this.#pattern = this.create(ctx);
    return this.#pattern;
  }
}
