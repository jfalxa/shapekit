import { BBox } from "../bounds/bbox";
import { v, Vec2 } from "../utils/vec2";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { Segment } from "../paths/segment";
import { pointToLineDistance2 } from "../bounds/polyline";
import { epsilon } from "./bezier3";

export class Bezier2 {
  private static _p0 = new Vec2();
  private static _p1 = new Vec2();
  private static _p2 = new Vec2();
  private static _mid = new Vec2();

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

  static aabb(bezier2: QuadraticCurveTo, previous: Segment, out = new BBox()) {
    const { x: px, y: py } = previous;
    const { _cpx, _cpy, x, y } = bezier2;

    out.fit(px, py, x, y);

    const extremum = new Vec2();

    const ts: number[] = [
      ...solveExtrema(px, _cpx, x), //
      ...solveExtrema(py, _cpy, y),
    ];

    for (let i = 0; i < ts.length; i++) {
      Bezier2.sample(px, py, _cpx, _cpy, x, y, ts[i], extremum);
      out.fit(extremum.x, extremum.y);
    }

    return out;
  }

  static adaptiveSample(
    bezier2: QuadraticCurveTo,
    previous: Segment,
    quality: number,
    out: Vec2[] = [],
    startIndex = out.length
  ): number {
    const p0 = this._p0.put(previous.x, previous.y);
    const p1 = this._p1.put(bezier2._cpx, bezier2._cpy);
    const p2 = this._p2.put(bezier2.x, bezier2.y);
    const tolerance2 = (1 / quality) * (1 / quality);

    const finalLength = Bezier2.subdivision(
      p0,
      p1,
      p2,
      tolerance2,
      out,
      startIndex
    );
    return finalLength;
  }

  private static subdivision(
    a: Vec2,
    b: Vec2,
    c: Vec2,
    t2: number,
    out: Vec2[],
    writeIndex: number
  ): number {
    const mid = this._mid;
    Bezier2.sample(a.x, a.y, b.x, b.y, c.x, c.y, 0.5, mid);

    if (pointToLineDistance2(mid, a, c) <= t2) {
      if (writeIndex < out.length) {
        out[writeIndex].put(c.x, c.y);
      } else {
        out[writeIndex] = new Vec2(c.x, c.y);
      }
      return writeIndex + 1;
    } else {
      const ab = v(a).add(b).scale(0.5);
      const bc = v(b).add(c).scale(0.5);
      const abc = v(ab).add(bc).scale(0.5);
      const midIndex = Bezier2.subdivision(a, ab, abc, t2, out, writeIndex);
      return Bezier2.subdivision(abc, bc, c, t2, out, midIndex);
    }
  }
}

function solveExtrema(p0: number, cp: number, p1: number) {
  const ts: number[] = [];
  const denomX = p0 - 2 * cp + p1;
  if (!epsilon(denomX)) {
    const tx = (p0 - cp) / denomX;
    if (tx > 0 && tx < 1) ts.push(tx);
  }
  return ts;
}
