import { AABB } from "../bbox/aabb";
import { v, Vec2 } from "../math/vec2";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { pointToLineDistance2 } from "../utils/polyline";
import { epsilon } from "./bezier3";

export class Bezier2 {
  static sample(
    px: number,
    py: number,
    cpx: number,
    cpy: number,
    x: number,
    y: number,
    t: number,
    out = new Vec2()
  ) {
    out.x = (1 - t) * (1 - t) * px + 2 * (1 - t) * t * cpx + t * t * x;
    out.y = (1 - t) * (1 - t) * py + 2 * (1 - t) * t * cpy + t * t * y;
    return out;
  }

  static aabb(bezier2: QuadraticCurveTo, out = new AABB()) {
    const { _px, _py, _cpx, _cpy, x, y } = bezier2;

    out.mergePoints(_px, _py, x, y);

    const extremum = new Vec2();
    const ts: number[] = [...solve(_px, _cpx, x), ...solve(_py, _cpy, y)];

    for (let i = 0; i < ts.length; i++) {
      Bezier2.sample(_px, _py, _cpx, _cpy, x, y, ts[i], extremum);
      out.mergeVector(extremum);
    }

    return out;
  }

  static adaptiveSample(
    bezier2: QuadraticCurveTo,
    quality: number,
    out: Vec2[] = []
  ): Vec2[] {
    const p0 = new Vec2(bezier2._px, bezier2._py);
    const p1 = new Vec2(bezier2._cpx, bezier2._cpy);
    const p2 = new Vec2(bezier2.x, bezier2.y);
    const tolerance2 = (1 / quality) * (1 / quality);
    return Bezier2.subdivision(p0, p1, p2, tolerance2, out);
  }

  static subdivision(a: Vec2, b: Vec2, c: Vec2, t2: number, out: Vec2[]) {
    const mid = Bezier2.sample(a.x, a.y, b.x, b.y, c.x, c.y, 0.5);

    if (pointToLineDistance2(mid, a, c) <= t2) {
      out.push(new Vec2(c.x, c.y));
    } else {
      const ab = v(a).add(b).scale(0.5);
      const bc = v(b).add(c).scale(0.5);
      const abc = v(ab).add(bc).scale(0.5);
      Bezier2.subdivision(a, ab, abc, t2, out);
      Bezier2.subdivision(abc, bc, c, t2, out);
    }

    return out;
  }
}

function solve(a: number, b: number, c: number) {
  const ts: number[] = [];
  const denomX = a - 2 * b + c;
  if (!epsilon(denomX)) {
    const tx = (a - b) / denomX;
    if (tx > 0 && tx < 1) ts.push(tx);
  }
  return ts;
}
