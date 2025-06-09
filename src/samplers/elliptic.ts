import { BBox } from "../bounds/bbox";
import { v, Vec2 } from "../utils/vec2";
import { Arc } from "../paths/arc";
import { ArcTo } from "../paths/arc-to";
import { Ellipse } from "../paths/ellipse";
import { Segment } from "../paths/segment";

const TWO_PI = 2 * Math.PI;

export interface ArcLike {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  startAngle: number;
  endAngle: number;
  counterclockwise?: boolean;
}

export class Elliptic {
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
    const angleX = radiusX * Math.cos(angle);
    const angleY = radiusY * Math.sin(angle);

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    out.x = x + angleX * cosR - angleY * sinR;
    out.y = y + angleX * sinR + angleY * cosR;

    return out;
  }

  static aabb(elliptic: Arc | Ellipse | ArcTo | ArcLike, out = new BBox()) {
    const {
      x,
      y,
      radiusX,
      radiusY,
      startAngle,
      endAngle,
      rotation,
      counterclockwise,
    } = Elliptic.normalize(elliptic);

    const base = ((startAngle % TWO_PI) + TWO_PI) % TWO_PI;
    const sweep = Elliptic.sweep(startAngle, endAngle, counterclockwise);

    const ts: number[] = [0, 1];
    const point = new Vec2();

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    const angleX = Math.atan2(-radiusY * sinR, radiusX * cosR);
    const angleY = Math.atan2(radiusY * cosR, radiusX * sinR);

    for (const angle of [angleX, angleX + Math.PI, angleY, angleY + Math.PI]) {
      let delta = angle - base;
      if (delta < 0) delta += TWO_PI;
      if (counterclockwise) delta = delta - TWO_PI;

      const t = delta / sweep;
      const isValidPositive = sweep >= 0 && delta >= 0 && delta <= sweep;
      const isValidNegative = sweep < 0 && delta <= 0 && delta >= sweep;

      if (0 <= t && t <= 1 && (isValidPositive || isValidNegative)) {
        ts.push(t);
      }
    }

    ts.sort((a, b) => a - b);

    for (let i = 0; i < ts.length; i++) {
      if (radiusX !== radiusY || rotation !== 0) {
        Elliptic.sampleEllipse(x, y, radiusX, radiusY, rotation, startAngle, sweep, ts[i], point) // prettier-ignore
      } else {
        Elliptic.sampleCircle(x, y, radiusX, startAngle, sweep, ts[i], point); // prettier-ignore
      }

      out.fit(point.x, point.y);
    }

    return out;
  }

  static adaptiveSample(
    elliptic: Arc | Ellipse | ArcTo | ArcLike,
    quality: number,
    out: Vec2[] = []
  ) {
    const {
      x,
      y,
      radiusX,
      radiusY,
      startAngle,
      endAngle,
      counterclockwise,
      rotation,
    } = Elliptic.normalize(elliptic);

    const radius = Math.max(radiusX, radiusY);

    if (radius === 0) {
      out.push(new Vec2(x, y));
      return out;
    }

    const tolerance = 1 / quality;
    const step = 2 * Math.acos(1 - tolerance / radius);
    const sweep = Elliptic.sweep(startAngle, endAngle, counterclockwise);
    const divisions = Math.abs(Math.ceil(sweep / step)) || 0;

    for (let i = 0; i <= divisions; i++) {
      const point = new Vec2();
      const t = i / divisions;
      if (radiusX !== radiusY) {
        Elliptic.sampleEllipse(x, y, radiusX, radiusY, rotation, startAngle, sweep, t, point); // prettier-ignore
      } else {
        Elliptic.sampleCircle(x, y, radiusX, startAngle, sweep, t, point);
      }
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

  static normalize(e: Arc | Ellipse | ArcTo | ArcLike) {
    return {
      radiusX: e.radiusX,
      radiusY: e.radiusY,
      x: e instanceof ArcTo ? e._x : e.x,
      y: e instanceof ArcTo ? e._y : e.y,
      startAngle: e instanceof ArcTo ? e._startAngle : e.startAngle,
      endAngle: e instanceof ArcTo ? e._endAngle : e.endAngle,
      counterclockwise:
        e instanceof ArcTo ? false : e.counterclockwise ?? false,
      rotation: e instanceof Ellipse ? e.rotation : 0,
    };
  }
}

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
  arcTo._startAngle = startAngle;
  arcTo._endAngle = endAngle;

  return arcTo;
}

function isExactCircle(sweep: number) {
  if (sweep % TWO_PI === 0) return true;
  else if (Math.abs((TWO_PI - sweep) % TWO_PI) < 1e-6) return true;
  else return false;
}
