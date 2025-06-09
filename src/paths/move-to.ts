import { Segment } from "./segment";

export function moveTo(x: number, y: number) {
  return new MoveTo(x, y);
}

export class MoveTo extends Segment {}
