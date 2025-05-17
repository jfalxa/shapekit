import { Segment, trackSegment } from "./segment";

export function ellipse(
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation = 0,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  counterclockwise?: boolean
) {
  return new Ellipse(
    x,
    y,
    radiusX,
    radiusY,
    rotation,
    startAngle,
    endAngle,
    counterclockwise
  );
}

export class Ellipse extends Segment {
  constructor(
    x: number,
    y: number,
    public radiusX: number,
    public radiusY: number,
    public rotation: number = 0,
    public startAngle: number = 0,
    public endAngle: number = 2 * Math.PI,
    public counterclockwise?: boolean
  ) {
    super(x, y);
  }
}

trackSegment(Ellipse, [
  "x",
  "y",
  "radiusX",
  "radiusY",
  "rotation",
  "startAngle",
  "endAngle",
  "counterclockwise",
]);
