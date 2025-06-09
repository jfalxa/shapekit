import { Segment, trackSegment } from "./segment";

export function ellipse(
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation?: number,
  startAngle?: number,
  endAngle?: number,
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
  declare x: number;
  declare y: number;
  declare radiusX: number;
  declare radiusY: number;
  declare rotation: number;
  declare startAngle: number;
  declare endAngle: number;
  declare counterclockwise: boolean;

  constructor(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number = 0,
    startAngle: number = 0,
    endAngle: number = 2 * Math.PI,
    counterclockwise = false
  ) {
    super(x, y);
    this.x = x;
    this.y = y;
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.rotation = rotation;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.counterclockwise = counterclockwise;
  }
}

trackSegment(Ellipse, [
  "radiusX",
  "radiusY",
  "rotation",
  "startAngle",
  "endAngle",
  "counterclockwise",
]);
