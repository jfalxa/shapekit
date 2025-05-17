import { Segment, trackSegment } from "./segment";

export function bezierCurveTo(
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  x: number,
  y: number
) {
  return new BezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
}

export class BezierCurveTo extends Segment {
  constructor(
    public cp1x: number,
    public cp1y: number,
    public cp2x: number,
    public cp2y: number,
    x: number,
    y: number
  ) {
    super(x, y);
  }
}

trackSegment(BezierCurveTo, ["cp1x", "cp1y", "cp2x", "cp2y"]);
