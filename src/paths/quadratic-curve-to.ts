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
  declare cpx?: number;
  declare cpy?: number;

  _cpx!: number;
  _cpy!: number;

  constructor(cpx: number, cpy: number, x?: number, y?: number) {
    super(x ?? cpx, y ?? cpy);

    if (x !== undefined && y !== undefined) {
      this.cpx = cpx;
      this.cpy = cpy;
    }
  }
}

trackSegment(QuadraticCurveTo, ["cpx", "cpy"]);
