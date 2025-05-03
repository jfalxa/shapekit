import { Point, Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function arc(
  x: number,
  y: number,
  radius: number,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  counterclockwise?: boolean
) {
  return new Arc(x, y, radius, startAngle, endAngle, counterclockwise);
}

export class Arc extends Segment {
  radiusX: number;
  radiusY: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    public startAngle = 0,
    public endAngle = 2 * Math.PI,
    public counterclockwise?: boolean
  ) {
    super(x, y);
    this.radiusX = radius;
    this.radiusY = radius;
  }

  apply(path: Path2D) {
    if (this.radiusX === this.radiusY) {
      path.arc(
        this.to.x,
        this.to.y,
        this.radiusX,
        this.startAngle,
        this.endAngle,
        this.counterclockwise
      );
    } else {
      path.ellipse(
        this.to.x,
        this.to.y,
        this.radiusX,
        this.radiusY,
        0,
        this.startAngle,
        this.endAngle,
        this.counterclockwise
      );
    }
  }

  sample(quality: number): Vec2[] {
    return Arc.adaptiveSample(
      this.to,
      this.radiusX,
      this.radiusY,
      this.startAngle,
      this.endAngle,
      quality,
      this.points
    );
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.radiusX *= sx;
    this.radiusY *= sy;
  }

  static sample(
    center: Point,
    rx: number,
    ry: number,
    startAngle: number,
    endAngle: number,
    t: number,
    out = new Vec2(0, 0)
  ) {
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;
    const angle = startAngle + angleDiff * t;

    out.x = center.x + rx * Math.cos(angle);
    out.y = center.y + ry * Math.sin(angle);

    return out;
  }

  static adaptiveSample(
    center: Point,
    rx: number,
    ry: number,
    startAngle: number,
    endAngle: number,
    quality: number,
    out: Vec2[] = [],
    offset = 0
  ) {
    const tolerance = 1 / quality;
    const radius = Math.max(rx, ry);
    const step = 2 * Math.acos(1 - tolerance / radius);
    const span = Math.abs(endAngle - startAngle);
    const divisions = Math.ceil(span / step);

    for (let i = 0; i <= divisions; i++) {
      const io = offset + i;
      const t = i / divisions;
      out[io] = Arc.sample(center, rx, ry, startAngle, endAngle, t, out[io]);
    }

    out.length = offset + divisions + 1;
    return out;
  }
}
