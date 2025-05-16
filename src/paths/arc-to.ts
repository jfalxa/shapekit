import { Segment } from "./segment";

export function arcTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 0
) {
  return new ArcTo(x1, y1, x2, y2, radius);
}

export class ArcTo extends Segment {
  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    public radius = 0
  ) {
    super(x2, y2);
  }
}
