import { Shape } from "../renderables/shape";
import { toArc } from "../samplers/elliptic";
import { remove } from "../utils/array";
import { Cache, markDirty } from "../utils/cache";
import { ArcTo } from "./arc-to";
import { BezierCurveTo } from "./bezier-curve-to";
import { ClosePath } from "./close-path";
import { MoveTo } from "./move-to";
import { QuadraticCurveTo } from "./quadratic-curve-to";
import { Segment } from "./segment";

export type PathLike = Segment[];

export class Path extends Array<Segment> implements Cache {
  quality: number;
  shape?: Shape;

  __version: number;
  __cache: Record<string, any>;
  __isDirty: boolean;

  constructor(segments: Segment[] = [], quality = 1, shape?: Shape) {
    super(segments.length);

    this.quality = quality;
    this.shape = shape;
    this.__version = 0;
    this.__cache = {};
    this.__isDirty = true;

    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
      this[i].path = this;
    }
  }

  add(...segments: Segment[]) {
    this.push(...segments);
    for (let i = 0; i < segments.length; i++) segments[i].path = this;
    markDirty(this);
  }

  insert(index: number, ...segments: Segment[]) {
    this.splice(index, 0, ...segments);
    for (let i = 0; i < segments.length; i++) segments[i].path = this;
    markDirty(this);
  }

  remove(...segments: Segment[]) {
    remove(this, segments);
    for (let i = 0; i < segments.length; i++) segments[i].path = undefined;
    markDirty(this);
  }
}

export function updatePath(path: Path) {
  let lastMoveTo: MoveTo | undefined;
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s instanceof MoveTo) {
      lastMoveTo = s;
    } else if (s instanceof ClosePath && lastMoveTo) {
      s.x = lastMoveTo.x;
      s.y = lastMoveTo.y;
    } else if (s instanceof ArcTo) {
      toArc(s, path[i - 1]);
    } else if (s instanceof QuadraticCurveTo) {
      [s._cpx, s._cpy] = getControl(s, path[i - 1]);
    } else if (s instanceof BezierCurveTo) {
      [s._cp1x, s._cp1y] = getControl(s, path[i - 1]);
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
