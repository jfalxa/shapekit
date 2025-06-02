import { Shape } from "../renderables/shape";
import { remove } from "../utils/array";
import { ArcTo, toArc } from "./arc-to";
import { BezierCurveTo } from "./bezier-curve-to";
import { ClosePath } from "./close-path";
import { MoveTo } from "./move-to";
import { QuadraticCurveTo } from "./quadratic-curve-to";
import { Segment } from "./segment";

export type PathLike = Segment[];

export class Path extends Array<Segment> {
  constructor(segments: Segment[] = [], public shape?: Shape) {
    super();
    this.add(...segments);
  }

  add(...segments: Segment[]) {
    this.push(...segments);
    for (let i = 0; i < segments.length; i++) segments[i].path = this;
    if (this.shape) this.shape.__isContentDirty = true;
  }

  insert(index: number, ...segments: Segment[]) {
    this.splice(index, 0, ...segments);
    for (let i = 0; i < segments.length; i++) segments[i].path = this;
    if (this.shape) this.shape.__isContentDirty = true;
  }

  remove(...segments: Segment[]) {
    remove(this, segments);
    for (let i = 0; i < segments.length; i++) segments[i].path = undefined;
    if (this.shape) this.shape.__isContentDirty = true;
  }

  update() {
    let lastMoveTo: MoveTo | undefined;
    for (let i = 0; i < this.length; i++) {
      const s = this[i];
      if (s instanceof MoveTo) {
        lastMoveTo = s;
      } else if (s instanceof ClosePath && lastMoveTo) {
        s.x = lastMoveTo.x;
        s.y = lastMoveTo.y;
      } else if (s instanceof ArcTo) {
        toArc(s, this[i - 1]);
      } else if (s instanceof QuadraticCurveTo) {
        [s._cpx, s._cpy] = getControl(s, this[i - 1]);
      } else if (s instanceof BezierCurveTo) {
        [s._cp1x, s._cp1y] = getControl(s, this[i - 1]);
      }
    }
  }
}

function getControl(
  bezier: QuadraticCurveTo | BezierCurveTo,
  previous: Segment | undefined
) {
  let x = bezier instanceof QuadraticCurveTo ? bezier.cpx : bezier.cp1x;
  let y = bezier instanceof QuadraticCurveTo ? bezier.cpy : bezier.cp1y;

  if (x === undefined || y === undefined) {
    if (previous instanceof QuadraticCurveTo) {
      x = previous.x * 2 - previous._cpx;
      y = previous.y * 2 - previous._cpy;
    } else if (previous instanceof BezierCurveTo) {
      x = previous.x * 2 - previous.cp2x;
      y = previous.y * 2 - previous.cp2y;
    } else if (previous) {
      x = previous.x;
      y = previous.y;
    } else {
      throw new Error("Missing control point");
    }
  }

  return [x, y] as const;
}
