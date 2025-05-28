import { AABB } from "../bbox/aabb";
import { v, Vec2 } from "../math/vec2";
import { Arc as ArcSegment } from "../paths/arc";
import { ArcTo } from "../paths/arc-to";
import { Ellipse as EllipseSegment } from "../paths/ellipse";
import { Segment } from "../paths/segment";

const TWO_PI = 2 * Math.PI;
const EXTREMA = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

export class Arc {
  static sampleCircle(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    sweep: number,
    t: number,
    out = new Vec2()
  ) {
    const angle = startAngle + sweep * t;
    out.x = x + radius * Math.cos(angle);
    out.y = y + radius * Math.sin(angle);
    return out;
  }

  static sampleEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    sweep: number,
    t: number,
    out = new Vec2()
  ) {
    const angle = startAngle + sweep * t;

    const ax = radiusX * Math.cos(angle);
    const ay = radiusY * Math.sin(angle);

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    out.x = x + ax * cos - y * sin;
    out.y = y + ay * sin + y * cos;

    return out;
  }

  static aabb(arc: ArcSegment | EllipseSegment, out = new AABB()) {
    const { x, y, startAngle, endAngle, counterclockwise } = arc;

    const extremum = new Vec2();
    const base = ((startAngle % TWO_PI) + TWO_PI) % TWO_PI;
    const sweep = Arc.sweep(startAngle, endAngle, counterclockwise);

    for (const quad of EXTREMA) {
      let delta = quad - base;
      if (delta < 0) delta += TWO_PI;
      if (counterclockwise) delta = delta - TWO_PI;

      const t = delta / sweep;
      const isValidPositive = sweep >= 0 && delta >= 0 && delta <= sweep;
      const isValidNegative = sweep < 0 && delta <= 0 && delta >= sweep;

      if (0 <= t && t <= 1 && (isValidPositive || isValidNegative)) {
        arc instanceof EllipseSegment
          ? Arc.sampleEllipse(x, y, arc.radiusX, arc.radiusY, 0, startAngle, sweep, t, extremum) // prettier-ignore
          : Arc.sampleCircle(x, y, arc.radius, startAngle, sweep, t, extremum);

        out.mergeVector(extremum);
      }
    }

    return out;
  }

  static adaptiveSample(
    arc: ArcSegment | EllipseSegment,
    quality: number,
    out: Vec2[] = []
  ) {
    const { x, y, startAngle, endAngle, counterclockwise } = arc;

    const radius =
      arc instanceof EllipseSegment
        ? Math.max(arc.radiusX, arc.radiusY)
        : arc.radius;

    if (radius === 0) {
      out.push(new Vec2(x, y));
      return out;
    }

    const tolerance = 1 / quality;
    const step = 2 * Math.acos(1 - tolerance / radius);
    const sweep = Arc.sweep(startAngle, endAngle, counterclockwise);
    const divisions = Math.abs(Math.ceil(sweep / step)) || 0;

    for (let i = 0; i <= divisions; i++) {
      const point =
        arc instanceof EllipseSegment
          ? Arc.sampleEllipse(x, y, arc.radiusX, arc.radiusY, 0, startAngle, sweep, i / divisions) // prettier-ignore
          : Arc.sampleCircle(x, y, arc.radius, startAngle, sweep, i / divisions); // prettier-ignore

      out.push(point);
    }

    return out;
  }

  static sweep(
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean
  ) {
    let sweep = endAngle - startAngle;
    if (!counterclockwise && sweep >= TWO_PI) {
      sweep = TWO_PI;
    } else if (counterclockwise && -sweep >= TWO_PI) {
      sweep = -TWO_PI;
    } else if (isExactCircle(sweep)) {
      sweep = counterclockwise ? -TWO_PI : TWO_PI;
    } else if (!counterclockwise) {
      sweep = sweep % TWO_PI;
      sweep = sweep < 0 ? sweep + TWO_PI : sweep;
    } else {
      sweep = sweep % TWO_PI;
      sweep = sweep > 0 ? sweep - TWO_PI : sweep;
    }
    return sweep;
  }

  static toArc(arcTo: ArcTo, previous: Segment | undefined) {
    if (!previous) throw new Error("Missing previous segment");

    const from = new Vec2(previous.x, previous.y);
    const cp = new Vec2(arcTo.cpx, arcTo.cpy);
    const to = new Vec2(arcTo.x, arcTo.y);

    const r = arcTo.radius;

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

    return new ArcSegment(center.x, center.y, startAngle, endAngle, r);
  }
}

function isExactCircle(sweep: number) {
  if (sweep % TWO_PI === 0) return true;
  else if (Math.abs((TWO_PI - sweep) % TWO_PI) < 1e-6) return true;
  else return false;
}
