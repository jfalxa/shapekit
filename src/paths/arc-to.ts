import { epsilon } from "../math/num";
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
  _control: Vec2;
  _radiusX: number;
  _radiusY: number;

  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    public radius = 0
  ) {
    super(x2, y2);
    this._control = new Vec2(x1, y1);
    this._radiusX = radius;
    this._radiusY = radius;
  }

  scale(sx: number, sy: number) {
    this._to.put(this.x2, this.y2).scale(sx, sy);
    this._control.put(this.x1, this.y1).scale(sx, sy);
    this._radiusX = this.radius * Math.abs(sx);
    this._radiusY = this.radius * Math.abs(sy);
  }

  apply(path: Path2D) {
    if (this._radiusX === this._radiusY) {
      path.arcTo(
        this._control.x,
        this._control.y,
        this._to.x,
        this._to.y,
        this._radiusX
      );
    } else {
      const arc = ArcTo.toArc(
        this._from,
        this._control,
        this._to,
        this._radiusX,
        this._radiusY
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
      this._from,
      this._control,
      this._to,
      this._radiusX,
      this._radiusY
    );

    return Arc.adaptiveSample(
      arc.center,
      arc.radiusX,
      arc.radiusY,
      arc.startAngle,
      arc.endAngle,
      false,
      quality,
      this.points
    );
  }

  aabb() {
    const arc = ArcTo.toArc(
      this._from,
      this._control,
      this._to,
      this._radiusX,
      this._radiusY
    );
    return Arc.aabb(
      arc.center,
      arc.radiusX,
      arc.radiusY,
      arc.startAngle,
      arc.endAngle,
      false,
      this
    ) as this;
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

    if (epsilon(unit.x) || epsilon(unit.y)) {
      return {
        center: Vec2.ZERO,
        startAngle: 0,
        endAngle: 0,
        radiusX: 0,
        radiusY: 0,
      };
    }

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
