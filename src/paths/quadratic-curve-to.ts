import { BezierCurveTo } from "./bezier-curve-to";
import { Segment, trackSegment } from "./segment";

export function quadraticCurveTo(
  cpx: number,
  cpy: number,
  x?: number,
  y?: number
) {
  return new QuadraticCurveTo(cpx, cpy, x, y);
}

export class QuadraticCurveTo extends Segment {
  cpx?: number;
  cpy?: number;
  _cpx!: number;
  _cpy!: number;

  constructor(cpx: number, cpy: number, x?: number, y?: number) {
    super(x ?? cpx, y ?? cpy);

    if (x !== undefined && y !== undefined) {
      this.cpx = cpx;
      this.cpy = cpy;
    }
  }

  link(previous: Segment | undefined) {
    super.link(previous);
    if (this.cpx !== undefined && this.cpy !== undefined) {
      this._cpx = this.cpx;
      this._cpy = this.cpy;
    } else if (previous instanceof QuadraticCurveTo) {
      this._cpx = previous.x * 2 - previous._cpx;
      this._cpy = previous.y * 2 - previous._cpy;
    } else if (previous instanceof BezierCurveTo) {
      this._cpx = previous.x * 2 - previous.cp2x;
      this._cpy = previous.y * 2 - previous.cp2y;
    } else if (previous) {
      this._cpx = previous.x;
      this._cpy = previous.y;
    } else {
      throw new Error("Missing control point");
    }
  }
}

trackSegment(QuadraticCurveTo, ["cpx", "cpy"]);
