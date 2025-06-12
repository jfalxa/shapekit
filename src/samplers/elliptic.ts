import { BBox } from "../bounds/bbox";
import { Vec2 } from "../utils/vec2";
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
  private static _point = new Vec2();
  private static _tempPoint = new Vec2();

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
    const point = this._point;

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
    out: Vec2[] = [],
    startIndex = out.length
  ): number {
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
      if (startIndex < out.length) {
        out[startIndex].put(x, y);
      } else {
        out[startIndex] = new Vec2(x, y);
      }
      return startIndex + 1;
    }

    const tolerance = 1 / quality;
    const step = 2 * Math.acos(1 - tolerance / radius);
    const sweep = Elliptic.sweep(startAngle, endAngle, counterclockwise);
    const divisions = Math.abs(Math.ceil(sweep / step)) || 0;

    let writeIndex = startIndex;
    const point = this._tempPoint;

    for (let i = 0; i <= divisions; i++) {
      const t = i / divisions;
      if (radiusX !== radiusY) {
        Elliptic.sampleEllipse(x, y, radiusX, radiusY, rotation, startAngle, sweep, t, point); // prettier-ignore
      } else {
        Elliptic.sampleCircle(x, y, radiusX, startAngle, sweep, t, point);
      }

      if (writeIndex < out.length) {
        out[writeIndex].put(point.x, point.y);
      } else {
        out[writeIndex] = new Vec2(point.x, point.y);
      }
      writeIndex++;
    }

    return writeIndex;
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

// Static Vec2 instances for toArc function
const _toArc_r = new Vec2();
const _toArc_from = new Vec2();
const _toArc_cp = new Vec2();
const _toArc_to = new Vec2();
const _toArc_v0 = new Vec2();
const _toArc_v2 = new Vec2();
const _toArc_t0 = new Vec2();
const _toArc_t1 = new Vec2();
const _toArc_bisector = new Vec2();
const _toArc_center = new Vec2();

export function toArc(arcTo: ArcTo, previous: Segment | undefined) {
  if (!previous) throw new Error("Missing previous segment");

  const r = _toArc_r.put(arcTo.radiusX, arcTo.radiusY);

  const from = _toArc_from.put(previous.x, previous.y).divide(r);
  const cp = _toArc_cp.put(arcTo.cpx, arcTo.cpy).divide(r);
  const to = _toArc_to.put(arcTo.x, arcTo.y).divide(r);

  const v0 = _toArc_v0.put(from.x, from.y).subtract(cp).normalize();
  const v2 = _toArc_v2.put(to.x, to.y).subtract(cp).normalize();

  const theta = Math.acos(v0.dot(v2));

  const d = 1 / Math.tan(theta / 2);

  const t0 = _toArc_t0.put(v0.x, v0.y).scale(d).add(cp);
  const t1 = _toArc_t1.put(v2.x, v2.y).scale(d).add(cp);

  const bisector = _toArc_bisector.put(v0.x, v0.y).add(v2).normalize();

  const offset = 1 / Math.sin(theta / 2);
  const center = _toArc_center
    .put(bisector.x, bisector.y)
    .scale(offset)
    .add(cp);

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
