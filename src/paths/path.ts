import { LightShape } from "../renderables/light-shape";
import { Point } from "../math/vec2";
import { Arc as ArcSampler } from "../samplers/arc";
import { ArcTo } from "./arc-to";
import { BezierCurveTo } from "./bezier-curve-to";
import { Arc } from "./arc";
import { ClosePath } from "./close-path";
import { Ellipse } from "./ellipse";
import { LineTo } from "./line-to";
import { MoveTo } from "./move-to";
import { QuadraticCurveTo } from "./quadratic-curve-to";
import { Rect } from "./rect";
import { Segment } from "./segment";
import { RoundRect } from "./round-rect";

export type PathLike = ArrayLike<Segment>;

export class Path extends Array<Segment> {
  constructor(segments: PathLike = [], public shape?: LightShape) {
    super(segments.length);
    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
      this[i].path = this;
    }
  }

  scale(sx: number, sy: number) {
    const segments: Segment[] = new Array(this.length);
    let lastMoveTo: MoveTo | undefined;

    for (let i = 0; i < this.length; i++) {
      const s = this[i];
      let scaled: Segment;

      if (s instanceof LineTo) {
        scaled = new LineTo(s.x * sx, s.y * sy);
      } else if (s instanceof MoveTo) {
        scaled = new MoveTo(s.x * sx, s.y * sy);
        lastMoveTo = scaled;
      } else if (s instanceof ClosePath) {
        if (!lastMoveTo) throw new Error("Missing initial moveTo for closePath"); // prettier-ignore
        scaled = new ClosePath(lastMoveTo.x, lastMoveTo.y);
      } else if (s instanceof RoundRect) {
        scaled = new RoundRect(s.x * sx, s.y * sy, s.width * sx, s.height * sy, s.radius) // prettier-ignore
      } else if (s instanceof Rect) {
        console.log({ sx, sy });
        scaled = new Rect(s.x * sx, s.y * sy, s.width * sx, s.height * sy);
      } else if (s instanceof QuadraticCurveTo) {
        const cp = getControl(s, segments[i - 1], sx, sy);
        scaled = new QuadraticCurveTo(cp.x, cp.y, s.x * sx, s.y * sy);
      } else if (s instanceof BezierCurveTo) {
        const cp = getControl(s, segments[i - 1], sx, sy);
        scaled = new BezierCurveTo(cp.x, cp.y, s.cp2x * sx, s.cp2y * sy, s.x * sx, s.y * sy); // prettier-ignore
      } else if (s instanceof Ellipse) {
        scaled = new Ellipse(s.x * sx, s.y * sy, s.radiusX * sx, s.radiusY * sy, s.rotation, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
      } else if (s instanceof Arc) {
        scaled = sx !== sy
          ? new Ellipse(s.x * sx, s.y * sy, s.radius * sx, s.radius * sy, 0, s.startAngle, s.endAngle, s.counterclockwise) // prettier-ignore
          : new Arc(s.x * sx, s.y * sx, s.radius * sx, s.startAngle, s.endAngle, s.counterclockwise) // prettier-ignore
      } else if (s instanceof ArcTo) {
        if (sx !== sy) {
          const a = ArcSampler.toArc(s, segments[i - 1]);
          scaled = new Ellipse(a.x * sx, a.y * sy, a.radius * sx, a.radius * sy, 0, a.startAngle, a.endAngle) // prettier-ignore
        } else {
          scaled = new ArcTo(s.cpx * sx, s.cpy * sx, s.x * sx, s.y * sy, s.radius * sx); // prettier-ignore
        }
      } else {
        throw new Error("Segment type is not supported");
      }

      segments[i] = scaled;
    }

    return segments;
  }
}

function getControl(
  bezier: QuadraticCurveTo | BezierCurveTo,
  previous: Segment | undefined,
  sx = 1,
  sy = 1
): Point {
  let x = bezier instanceof QuadraticCurveTo ? bezier.cpx : bezier.cp1x;
  let y = bezier instanceof QuadraticCurveTo ? bezier.cpy : bezier.cp1y;

  if (x !== undefined && y !== undefined) {
    x *= sx;
    y *= sy;
  } else if (previous instanceof QuadraticCurveTo) {
    x = previous.x * 2 - previous.cpx!;
    y = previous.y * 2 - previous.cpy!;
  } else if (previous instanceof BezierCurveTo) {
    x = previous.x * 2 - previous.cp2x;
    y = previous.y * 2 - previous.cp2y;
  } else if (previous) {
    x = previous.x;
    y = previous.y;
  } else {
    throw new Error("Missing control point");
  }

  return { x, y };
}
