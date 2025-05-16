import { Segment } from "./segment";

export function rect(x: number, y: number, width: number, height: number) {
  return new Rect(x, y, width, height);
}

export class Rect extends Segment {
  constructor(
    x: number,
    y: number,
    public width: number,
    public height: number
  ) {
    super(x, y);
  }
}
