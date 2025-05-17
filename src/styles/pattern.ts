export type PatternRepetition =
  | "repeat"
  | "repeat-x"
  | "repeat-y"
  | "no-repeat";

export class Pattern {
  private __pattern?: CanvasPattern;

  constructor(
    public image: CanvasImageSource,
    public repetition: PatternRepetition
  ) {}

  get(ctx: CanvasRenderingContext2D) {
    if (this.__pattern) return this.__pattern;
    const pattern = ctx.createPattern(this.image, this.repetition);
    if (!pattern) throw new Error("Pattern image is not loaded yet");
    this.__pattern = pattern;
    return pattern;
  }
}
