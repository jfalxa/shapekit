import { Rect } from "./rect";

export function roundRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  return new RoundRect(x, y, width, height, radius);
}

export class RoundRect extends Rect {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public radius: number | [number, number, number, number]
  ) {
    super(x, y, width, height);
  }
}

RoundRect.track("radius");
