import { Point, Vec2 } from "../math/vec2";
import { Segment } from "./segment";

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
    public x: number,
    public y: number,
    public radiusX: number,
    public radiusY: number,
    public rotation: number = 0,
    public startAngle: number = 0,
    public endAngle: number = 2 * Math.PI,
    public counterclockwise?: boolean
  ) {
    super(x, y);
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.radiusX *= Math.abs(sx);
    this.radiusY *= Math.abs(sy);
  }

  apply(path: Path2D) {
    path.ellipse(
      this.to.x,
      this.to.y,
      this.radiusX,
      this.radiusY,
      this.rotation,
      this.startAngle,
      this.endAngle,
      this.counterclockwise
    );
  }

  sample(quality: number): Vec2[] {
    return Ellipse.adaptiveSample(
      this.to,
      this.radiusX,
      this.radiusY,
      this.rotation,
      this.startAngle,
      this.endAngle,
      quality,
      this.points
    );
  }

  static sample(
    center: Point,
    rx: number,
    ry: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    t: number,
    out = new Vec2(0, 0)
  ) {
    let span = endAngle - startAngle;
    if (span < 0) span += 2 * Math.PI;
    const angle = startAngle + span * t;

    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);

    out.x = center.x + x * Math.cos(rotation) - y * Math.sin(rotation);
    out.y = center.y + x * Math.sin(rotation) + y * Math.cos(rotation);

    return out;
  }

  /**
   * Adaptive sampling along rotated ellipse arc.
   */
  static adaptiveSample(
    center: Point,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    quality: number,
    out: Vec2[] = [],
    offset = 0
  ) {
    const tolerance = 1 / quality;
    const radius = Math.max(radiusX, radiusY);
    const step = 2 * Math.acos(1 - tolerance / radius);
    const span = Math.abs(endAngle - startAngle);
    const divisions = Math.ceil(span / step);

    for (let i = 0; i <= divisions; i++) {
      const io = offset + i;
      const t = i / divisions;
      out[io] = Ellipse.sample(
        center,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        endAngle,
        t,
        out[io]
      );
    }

    out.length = offset + divisions + 1;
    return out;
  }
}
