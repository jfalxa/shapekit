import { BBox } from "../bounds/bbox";
import { v, Vec2 } from "../math/vec2";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { Segment } from "../paths/segment";
import { pointToLineDistance2 } from "../utils/polyline";

export class Bezier3 {
  static sample(
    px: number,
    py: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
    t: number,
    out = new Vec2()
  ) {
    out.x =
      (1 - t) ** 3 * px +
      3 * (1 - t) ** 2 * t * cp1x +
      3 * (1 - t) * t ** 2 * cp2x +
      t ** 3 * x;

    out.y =
      (1 - t) ** 3 * py +
      3 * (1 - t) ** 2 * t * cp1y +
      3 * (1 - t) * t ** 2 * cp2y +
      t ** 3 * y;

    return out;
  }

  static aabb(bezier3: BezierCurveTo, previous: Segment, out = new BBox()) {
    const { x: p0x, y: p0y } = previous;
    const { _cp1x, _cp1y, cp2x, cp2y, x: p1x, y: p1y } = bezier3;

    out.fit(p1x, p1y);

    const extremum = new Vec2();

    const ts = [
      ...solve(p0x, _cp1x, cp2x, p1x),
      ...solve(p0y, _cp1y, cp2y, p1y),
    ];

    for (let i = 0; i < ts.length; i++) {
      if (ts[i] > 0 && ts[i] < 1) {
        Bezier3.sample(p0x, p0y, _cp1x, _cp1y, cp2x, cp2y, p1x, p1y, ts[i], extremum); // prettier-ignore
        out.fit(extremum.x, extremum.y);
      }
    }

    return out;
  }

  static adaptiveSample(
    bezier3: BezierCurveTo,
    previous: Segment,
    quality: number,
    out: Vec2[] = []
  ) {
    const p0 = new Vec2(previous.x, previous.y);
    const p1 = new Vec2(bezier3._cp1x, bezier3._cp1y);
    const p2 = new Vec2(bezier3.cp2x, bezier3.cp2y);
    const p3 = new Vec2(bezier3.x, bezier3.y);
    const tolerance2 = (1 / quality) * (1 / quality);
    return Bezier3.subdivision(p0, p1, p2, p3, tolerance2, out);
  }

  static subdivision(
    a: Vec2,
    b: Vec2,
    c: Vec2,
    d: Vec2,
    t2: number,
    out: Vec2[]
  ) {
    const mid = Bezier3.sample(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y, 0.5); // prettier-ignore
    const distance2 = pointToLineDistance2(mid, a, d);

    if (distance2 <= t2) {
      out.push(new Vec2(d.x, d.y));
    } else {
      const ab = v(a).add(b).scale(0.5);
      const bc = v(b).add(c).scale(0.5);
      const cd = v(c).add(d).scale(0.5);
      const abc = v(ab).add(bc).scale(0.5);
      const bcd = v(bc).add(cd).scale(0.5);
      const abcd = v(abc).add(bcd).scale(0.5);
      Bezier3.subdivision(abcd, bcd, cd, d, t2, out);
      Bezier3.subdivision(a, ab, abc, abcd, t2, out);
    }

    return out;
  }
}

// Helper to solve at^2 + bt + c = 0 and return real roots in (0,1)
export function solve(p0: number, cp1: number, cp2: number, p1: number) {
  const a = -p0 + 3 * cp1 - 3 * cp2 + p1;
  const b = 2 * (p0 - 2 * cp1 + cp2);
  const c = -p0 + cp1;

  if (epsilon(a)) {
    if (epsilon(b)) return [];
    const t = -c / b;
    return t > 0 && t < 1 ? [t] : [];
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const sqrtD = Math.sqrt(disc);
  const t1 = (-b + sqrtD) / (2 * a);
  const t2 = (-b - sqrtD) / (2 * a);
  const roots: number[] = [];
  if (t1 > 0 && t1 < 1) roots.push(t1);
  if (t2 > 0 && t2 < 1) roots.push(t2);
  return roots;
}

export function epsilon(a: number, b = 0) {
  return Math.abs(a - b) < 1e-8;
}
