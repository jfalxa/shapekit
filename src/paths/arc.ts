import { Segment, trackSegment } from "./segment";

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
  declare radius: number;
  declare startAngle: number;
  declare endAngle: number;
  declare counterclockwise: boolean;

  constructor(
    x: number,
    y: number,
    radius: number,
    startAngle = 0,
    endAngle = TWO_PI,
    counterclockwise = false
  ) {
    super(x, y);
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.counterclockwise = counterclockwise;
  }
}

trackSegment(Arc, ["radius", "startAngle", "endAngle", "counterclockwise"]);
