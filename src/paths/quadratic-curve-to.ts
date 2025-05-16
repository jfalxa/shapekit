import { Segment } from "./segment";

export function quadraticCurveTo(
  cpx: number,
  cpy: number,
  x: number,
  y: number
) {
  return new QuadraticCurveTo(cpx, cpy, x, y);
}

export class QuadraticCurveTo extends Segment {
  constructor(public cpx: number, public cpy: number, x: number, y: number) {
    super(x, y);
  }
}
