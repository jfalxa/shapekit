import { Segment } from "./segment";

export function lineTo(x: number, y: number) {
  return new LineTo(x, y);
}

export class LineTo extends Segment {}
