import { v, Vec2 } from "../math/vec2";
import { Segment, trackSegment } from "./segment";

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
  declare cpx: number;
  declare cpy: number;
  declare radiusX: number;
  declare radiusY: number;

  _x!: number;
  _y!: number;
  _radiusX!: number;
  _radiusY!: number;
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

export function toArc(arcTo: ArcTo, previous: Segment | undefined) {
  if (!previous) throw new Error("Missing previous segment");

  const r = new Vec2(arcTo.radiusX, arcTo.radiusY);

  const from = new Vec2(previous.x, previous.y).divide(r);
  const cp = new Vec2(arcTo.cpx, arcTo.cpy).divide(r);
  const to = new Vec2(arcTo.x, arcTo.y).divide(r);

  const v0 = v(from).subtract(cp).normalize();
  const v2 = v(to).subtract(cp).normalize();

  const theta = Math.acos(v0.dot(v2));

  const d = 1 / Math.tan(theta / 2);

  const t0 = v(v0).scale(d).add(cp);
  const t1 = v(v2).scale(d).add(cp);

  const bisector = v(v0).add(v2).normalize();

  const offset = 1 / Math.sin(theta / 2);
  const center = v(bisector).scale(offset).add(cp);

  const startAngle = Math.atan2(t0.y - center.y, t0.x - center.x);
  const endAngle = Math.atan2(t1.y - center.y, t1.x - center.x);

  center.multiply(r);

  arcTo._x = center.x;
  arcTo._y = center.y;
  arcTo._radiusX = r.x;
  arcTo._radiusY = r.y;
  arcTo._startAngle = startAngle;
  arcTo._endAngle = endAngle;

  return arcTo;
}
