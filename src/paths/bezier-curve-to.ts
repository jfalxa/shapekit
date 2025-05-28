import { QuadraticCurveTo } from "./quadratic-curve-to";
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
  _cp1x!: number;
  _cp1y!: number;

  cp2x: number;
  cp2y: number;

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

  link(previous: Segment | undefined): void {
    super.link(previous);
    if (this.cp1x !== undefined && this.cp1y !== undefined) {
      this._cp1x = this.cp1x;
      this._cp1y = this.cp1y;
    } else if (previous instanceof QuadraticCurveTo) {
      this._cp1x = previous.x * 2 - previous._cpx;
      this._cp1y = previous.y * 2 - previous._cpy;
    } else if (previous instanceof BezierCurveTo) {
      this._cp1x = previous.x * 2 - previous.cp2x;
      this._cp1y = previous.y * 2 - previous.cp2y;
    } else if (previous) {
      this._cp1x = previous.x;
      this._cp1y = previous.y;
    } else {
      throw new Error("Missing control point");
    }
  }
}

trackSegment(BezierCurveTo, ["cp1x", "cp1y", "cp2x", "cp2y"]);
