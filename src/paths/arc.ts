import { Point, Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function arc(
  x: number,
  y: number,
  radius: number,
  startAngle?: number,
  endAngle?: number,
  counterclockwise?: boolean
) {
  return new Arc(x, y, radius, startAngle, endAngle, counterclockwise);
}

const TWO_PI = 2 * Math.PI;
const HALF_PI = Math.PI / 2;
const EXTREMA = [0, HALF_PI, Math.PI, 3 * HALF_PI];

export class Arc extends Segment {
  radiusX: number;
  radiusY: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    public startAngle = 0,
    public endAngle = TWO_PI,
    public counterclockwise = false
  ) {
    super(x, y);
    this.radiusX = radius;
    this.radiusY = radius;
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.radiusX *= Math.abs(sx);
    this.radiusY *= Math.abs(sy);
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
      this.counterclockwise,
      quality,
      this.points
    );
  }

  static sample(
    center: Point,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    sweep: number,
    t: number,
    out = new Vec2(0, 0)
  ) {
    const angle = startAngle + sweep * t;
    out.x = center.x + radiusX * Math.cos(angle);
    out.y = center.y + radiusY * Math.sin(angle);
    return out;
  }

  static adaptiveSample(
    center: Point,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean,
    quality: number,
    out: Vec2[] = [],
    offset = 0
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

    const tolerance = 1 / quality;
    const radius = Math.max(radiusX, radiusY);
    const step = 2 * Math.acos(1 - tolerance / radius);
    const divisions = Math.abs(Math.ceil(sweep / step));

    const uniqueSteps = new Set<number>();
    for (let i = 0; i <= divisions; i++) uniqueSteps.add(i / divisions);

    const base = ((startAngle % TWO_PI) + TWO_PI) % TWO_PI;
    for (const quad of EXTREMA) {
      let delta = quad - base;
      if (delta < 0) delta += TWO_PI;
      if (counterclockwise) delta = delta - TWO_PI;

      const t = delta / sweep;
      const isValidPositive = sweep >= 0 && delta >= 0 && delta <= sweep;
      const isValidNegative = sweep < 0 && delta <= 0 && delta >= sweep;

      if (0 <= t && t <= 1 && (isValidPositive || isValidNegative)) {
        uniqueSteps.add(t);
      }
    }

    const steps = Array.from(uniqueSteps).sort((a, b) => a - b);

    for (let i = 0; i <= steps.length; i++) {
      out[i + offset] = Arc.sample(
        center,
        radiusX,
        radiusY,
        startAngle,
        sweep,
        steps[i],
        out[i + offset]
      );
    }

    out.length = offset + steps.length;
    return out;
  }
}

function isExactCircle(sweep: number) {
  if (sweep % TWO_PI === 0) return true;
  else if (Math.abs((TWO_PI - sweep) % TWO_PI) < 1e-6) return true;
  else return false;
}
