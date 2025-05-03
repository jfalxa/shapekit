import { Point, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { pointToLineDistance } from "../utils/polyline";
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

  join(aabb: BoundingBox) {
    const extrema = Arc.sampleExtrema(
      this.to,
      this.radiusX,
      this.radiusY,
      this.startAngle,
      this.endAngle
    );

    BoundingBox.fit(extrema, this);

    aabb.merge(this);
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
    const angleDiff = 2 * Math.acos(1 - tolerance / radius);
    const span = Math.abs(endAngle - startAngle);
    const segments = Math.ceil(span / angleDiff);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const io = offset + i;
      out[io] = Arc.sample(center, rx, ry, startAngle, endAngle, t, out[io]);
    }
    out.length = offset + segments + 1;
    return out;
  }

  static sampleExtrema(
    center: Point,
    rx: number,
    ry: number,
    startAngle: number,
    endAngle: number
  ) {
    const extrema: Vec2[] = [];
    const twoPi = Math.PI * 2;

    // normalize into [0, 2π)
    let start = startAngle % twoPi;
    if (start < 0) start += twoPi;
    let end = endAngle % twoPi;
    if (end <= 0) end += twoPi;

    // total swept angle, always positive
    let sweep = end - start;
    if (sweep < 0) sweep += twoPi;

    // helper to push a point at a given angle
    const pushAt = (ang: number) =>
      extrema.push(
        new Vec2(center.x + rx * Math.cos(ang), center.y + ry * Math.sin(ang))
      );

    // always include start and end
    pushAt(startAngle);
    pushAt(endAngle);

    // check the four cardinal angles
    for (let i = 0; i < 4; i++) {
      const ang = i * (Math.PI / 2);
      let d = ang - start;
      if (d < 0) d += twoPi;
      // if strictly between start and end, include
      if (d > 0 && d < sweep) {
        pushAt(ang);
      }
    }

    return extrema;
  }
}
