import { Segment, trackSegment } from "./segment";

export function bezierCurveTo(
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  x?: number,
  y?: number
) {
  return new BezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
}

export class BezierCurveTo extends Segment {
  declare cp1x?: number;
  declare cp1y?: number;
  declare cp2x: number;
  declare cp2y: number;

  constructor(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x?: number,
    y?: number
  ) {
    super(x ?? cp2x, y ?? cp2y);

    if (x !== undefined && y !== undefined) {
      this.cp1x = cp1x;
      this.cp1y = cp1y;
      this.cp2x = cp2x;
      this.cp2y = cp2y;
    } else {
      this.cp2x = cp1x;
      this.cp2y = cp1y;
    }
  }
}

trackSegment(BezierCurveTo, ["cp1x", "cp1y", "cp2x", "cp2y"]);
