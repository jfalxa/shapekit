import { BoundingBox } from "../bbox/bounding-box";
import { Vec2 } from "../math/vec2";
import { Arc } from "../paths/arc";
import { ArcTo } from "../paths/arc-to";
import { Ellipse } from "../paths/ellipse";

const TWO_PI = 2 * Math.PI;
const EXTREMA = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

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

    const ax = radiusX * Math.cos(angle);
    const ay = radiusY * Math.sin(angle);

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    out.x = x + ax * cos - y * sin;
    out.y = y + ay * sin + y * cos;

    return out;
  }

  static aabb(elliptic: Arc | Ellipse | ArcTo, out = new BoundingBox()) {
    const { x, y, radiusX, radiusY, startAngle, endAngle, counterclockwise } =
      Elliptic.normalize(elliptic);

    const extremum = new Vec2();
    const base = ((startAngle % TWO_PI) + TWO_PI) % TWO_PI;
    const sweep = Elliptic.sweep(startAngle, endAngle, counterclockwise);

    for (const quad of EXTREMA) {
      let delta = quad - base;
      if (delta < 0) delta += TWO_PI;
      if (counterclockwise) delta = delta - TWO_PI;

      const t = delta / sweep;
      const isValidPositive = sweep >= 0 && delta >= 0 && delta <= sweep;
      const isValidNegative = sweep < 0 && delta <= 0 && delta >= sweep;

      if (0 <= t && t <= 1 && (isValidPositive || isValidNegative)) {
        radiusX !== radiusY
          ? Elliptic.sampleEllipse(x, y, radiusX, radiusY, 0, startAngle, sweep, t, extremum) // prettier-ignore
          : Elliptic.sampleCircle(x, y, radiusX, startAngle, sweep, t, extremum); // prettier-ignore

        out.fit(extremum.x, extremum.y);
      }
    }

    return out;
  }

  static adaptiveSample(
    elliptic: Arc | Ellipse | ArcTo,
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
      const point =
        radiusX !== radiusY
          ? Elliptic.sampleEllipse(x, y, radiusX, radiusY, rotation, startAngle, sweep, i / divisions) // prettier-ignore
          : Elliptic.sampleCircle(x, y, radiusX, startAngle, sweep, i / divisions); // prettier-ignore

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

  static normalize(e: Arc | Ellipse | ArcTo) {
    return {
      radiusX: e.radiusX,
      radiusY: e.radiusY,
      x: e instanceof ArcTo ? e._x : e.x,
      y: e instanceof ArcTo ? e._y : e.y,
      startAngle: e instanceof ArcTo ? e._startAngle : e.startAngle,
      endAngle: e instanceof ArcTo ? e._endAngle : e.endAngle,
      counterclockwise: e instanceof ArcTo ? false : e.counterclockwise,
      rotation: e instanceof Ellipse ? e.rotation : 0,
    };
  }
}

function isExactCircle(sweep: number) {
  if (sweep % TWO_PI === 0) return true;
  else if (Math.abs((TWO_PI - sweep) % TWO_PI) < 1e-6) return true;
  else return false;
}
