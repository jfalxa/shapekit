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

  get(ctx: CanvasRenderingContext2D) {
    if (this.#pattern) return this.#pattern;
    const pattern = ctx.createPattern(this.image, this.repetition);
    if (!pattern) throw new Error("Pattern image is not loaded yet");
    this.#pattern = pattern;
    return pattern;
  }
}
