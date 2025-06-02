import { Segment, trackSegment } from "./segment";

export function arcTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius?: number
) {
  return new ArcTo(x1, y1, x2, y2, radius);
}

export class ArcTo extends Segment {
  declare cpx: number;
  declare cpy: number;
  declare radiusX: number;
  declare radiusY: number;

  _x!: number;
  _y!: number;
  _startAngle!: number;
  _endAngle!: number;

  set radius(value: number) {
    this.radiusX = value;
    this.radiusY = value;
  }

  constructor(cpx: number, cpy: number, x: number, y: number, radius = 0) {
    super(x, y);
    this.cpx = cpx;
    this.cpy = cpy;
    this.radiusX = radius;
    this.radiusY = radius;
  }
}

trackSegment(ArcTo, ["cpx", "cpy", "radiusX", "radiusY"]);
