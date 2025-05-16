import { Segment } from "./segment";

export function arc(
  x: number,
  y: number,
  radius: number,
  startAngle?: number,
  endAngle?: number,
  counterclockwise?: boolean
) {
  return new Arc(x, y, radius, startAngle, endAngle, counterclockwise);
}

const TWO_PI = 2 * Math.PI;

export class Arc extends Segment {
  constructor(
    x: number,
    y: number,
    public radius: number,
    public startAngle = 0,
    public endAngle = TWO_PI,
    public counterclockwise = false
  ) {
    super(x, y);
  }
}

Arc.track("x", "y", "radius", "startAngle", "endAngle", "counterclockwise");
