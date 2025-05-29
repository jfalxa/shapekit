import { Segment, trackSegment } from "./segment";

export function rect(x: number, y: number, width: number, height: number) {
  return new Rect(x, y, width, height);
}

export class Rect extends Segment {
  declare width: number;
  declare height: number;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y);
    this.width = width;
    this.height = height;
  }
}

trackSegment(Rect, ["width", "height"]);
