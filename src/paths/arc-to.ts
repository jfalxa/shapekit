import { Segment, trackSegment } from "./segment";

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
    public cpx: number,
    public cpy: number,
    x: number,
    y: number,
    public radius = 0
  ) {
    super(x, y);
  }
}

trackSegment(ArcTo, ["cpx", "cpy"]);
