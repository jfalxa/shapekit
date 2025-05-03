import { v, Vec2 } from "../math/vec2";
import { Arc } from "./arc";
import { Segment } from "./segment";

export function arcTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 0
) {
  return new ArcTo(x1, y1, x2, y2, radius);
}

export class ArcTo extends Segment {
  control: Vec2;
  radiusX: number;
  radiusY: number;

  constructor(x1: number, y1: number, x2: number, y2: number, radius = 0) {
    super(x2, y2);
    this.control = new Vec2(x1, y1);
    this.radiusX = radius;
    this.radiusY = radius;
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.control?.scale(sx, sy);
    this.radiusX *= sx;
    this.radiusY *= sy;
  }

  apply(path: Path2D) {
    if (this.radiusX === this.radiusY) {
      path.arcTo(
        this.control.x,
        this.control.y,
        this.to.x,
        this.to.y,
        this.radiusX
      );
    } else {
      const arc = ArcTo.toArc(
        this.from,
        this.control,
        this.to,
        this.radiusX,
        this.radiusY
      );

      path.ellipse(
        arc.center.x,
        arc.center.y,
        arc.radiusX,
        arc.radiusY,
        0,
        arc.startAngle,
        arc.endAngle
      );
    }
  }

  sample(quality: number) {
    const arc = ArcTo.toArc(
      this.from,
      this.control,
      this.to,
      this.radiusX,
      this.radiusY
    );

    return Arc.adaptiveSample(
      arc.center,
      arc.radiusX,
      arc.radiusY,
      arc.startAngle,
      arc.endAngle,
      quality,
      this.points
    );
  }

  static toArc(from: Vec2, cp: Vec2, to: Vec2, rx: number, ry: number) {
    if (rx === ry) {
      return ArcTo.toCircleArc(from, cp, to, rx);
    } else {
      return ArcTo.toEllipseArc(from, cp, to, rx, ry);
    }
  }

  static toCircleArc(from: Vec2, cp: Vec2, to: Vec2, r: number) {
    const v0 = v(from).subtract(cp).normalize();
    const v2 = v(to).subtract(cp).normalize();

    const theta = Math.acos(v0.dot(v2));

    const d = r / Math.tan(theta / 2);

    const t0 = v(v0).scale(d).add(cp);
    const t1 = v(v2).scale(d).add(cp);

    const bisector = v(v0).add(v2).normalize();

    const offset = r / Math.sin(theta / 2);
    const center = v(bisector).scale(offset).add(cp);

    const startAngle = Math.atan2(t0.y - center.y, t0.x - center.x);
    const endAngle = Math.atan2(t1.y - center.y, t1.x - center.x);

    return { center, startAngle, endAngle, radiusX: r, radiusY: r };
  }

  static toEllipseArc(from: Vec2, cp: Vec2, to: Vec2, rx: number, ry: number) {
    const unit = new Vec2(rx, ry);

    const _from = v(from).divide(unit);
    const _cp = v(cp).divide(unit);
    const _to = v(to).divide(unit);

    const arc = ArcTo.toCircleArc(_from, _cp, _to, 1);

    return {
      center: arc.center.multiply(unit),
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      radiusX: rx,
      radiusY: ry,
    };
  }
}
